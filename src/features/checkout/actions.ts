"use server";

import { cookies, headers } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { getPublishedProduct, getStore, storeLinker } from "@/lib/stores";
import { newOrderId } from "@/lib/order-id";
import { createInvoice, paymentMode } from "@/lib/xendit";
import { TIERS } from "@/config/tiers";
import { priceFor } from "@/lib/pricing";

export type CheckoutState = { error?: string; email?: string; phone?: string; redirect?: string } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Normalises 08xx / 628xx / +628xx to +628xx; returns null when it isn't an Indonesian mobile number. */
function normalisePhone(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const local = digits.startsWith("62") ? digits.slice(2) : digits.startsWith("0") ? digits.slice(1) : digits;
  return /^8\d{8,12}$/.test(local) ? `+62${local}` : null;
}

export async function startCheckout(storeKey: string, productId: string, _prev: CheckoutState, form: FormData): Promise<CheckoutState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const phoneRaw = String(form.get("phone") ?? "").trim();
  const echo = { email, phone: phoneRaw };

  if (!EMAIL_RE.test(email)) return { ...echo, error: "Email tidak valid." };
  const phone = normalisePhone(phoneRaw);
  if (!phone) return { ...echo, error: "Nomor WhatsApp tidak valid (contoh: 0812xxxxxxx)." };

  const store = await getStore(storeKey);
  if (!store || !store.is_active) return { ...echo, error: "Toko tidak tersedia." };
  const product = await getPublishedProduct(store.id, productId);
  if (!product) return { ...echo, error: "Produk tidak ditemukan." };
  if (product.stock_available < 1) return { ...echo, error: "Maaf, stok produk ini sedang habis." };

  const mode = paymentMode();
  if (mode === "unconfigured") {
    console.error("Checkout blocked: set XENDIT_SECRET_KEY (or PAYMENT_MODE=manual).");
    return { ...echo, error: "Pembayaran belum dikonfigurasi oleh toko. Coba lagi nanti." };
  }

  // Flash-sale price if a sale is running right now; always computed on the server.
  const amount = priceFor(product, store.tier).price;
  const ref = (await cookies()).get("ref")?.value ?? null;
  const orderId = newOrderId();
  const orderRef = adminDb.collection("orders").doc(orderId);
  // Price, title and store come from the database, never from the form.
  await orderRef.create({
    store_id: store.id,
    product_id: product.id,
    product_title: product.title,
    amount,
    credential_id: null,
    customer_contact: { email, phone },
    payment_status: "PENDING",
    xendit_invoice_id: null,
    xendit_invoice_url: null,
    delivery_status: "PENDING",
    warranty_status: "VALID",
    warranty_claim: null,
    needs_stock: false,
    renewal_notified: false,
    referral_code: ref,
    settlement: mode === "manual" ? "MANUAL" : "PLATFORM",
    platform_fee: Math.round((amount * TIERS[store.tier].feePercent) / 100),
    created_at: FieldValue.serverTimestamp(),
    paid_at: null,
    access_expires_at: null,
  });

  // Pay into the seller's XenPlatform sub-account once it is LIVE; until then the platform collects.
  const integrations = await adminDb.collection("stores").doc(store.id).collection("private").doc("integrations").get();
  const subAccountId = integrations.get("xendit_account_status") === "LIVE" ? (integrations.get("xendit_sub_account_id") as string) : null;

  const link = await storeLinker(storeKey);
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const successUrl = `${origin}${link(`/checkout/success?order=${orderId}`)}`;

  if (mode === "manual") return { redirect: successUrl };

  try {
    const invoice = await createInvoice({
      orderId,
      amount,
      description: `${product.title} — ${store.store_name}`,
      customer: { email, phone },
      successUrl,
      failureUrl: `${origin}${link(`/checkout/${product.id}`)}`,
      subAccountId,
      tier: store.tier,
    });
    await orderRef.update({ xendit_invoice_id: invoice.id, xendit_invoice_url: invoice.invoice_url, settlement: invoice.settlement });
    return { redirect: invoice.invoice_url };
  } catch (err) {
    console.error(err);
    await orderRef.update({ payment_status: "FAILED" });
    return { ...echo, error: "Gagal membuat tagihan pembayaran. Silakan coba lagi." };
  }
}
