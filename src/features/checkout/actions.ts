"use server";

import { cookies, headers } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { getPublishedProduct, getStore, storeLinker } from "@/lib/stores";
import { newOrderId } from "@/lib/order-id";
import { createInvoice, isPaymentChannel, paymentMode } from "@/lib/xendit";
import { getCustomer } from "@/lib/customer";
import { TIERS } from "@/config/tiers";
import { priceFor } from "@/lib/pricing";
import { allow } from "@/lib/rate-limit";
import { normalisePhone } from "@/lib/phone";
import { evaluateVoucher, normaliseCode } from "@/lib/voucher";
import { toVoucher, voucherRef } from "@/lib/vouchers-server";

export type CheckoutState = { error?: string; email?: string; phone?: string; voucher?: string; redirect?: string } | undefined;

export type VoucherPreview = { ok: true; code: string; discount: number; total: number } | { ok: false; error: string };

/** "Pakai" button: shows the discount before paying. The real check repeats inside checkout. */
export async function checkVoucher(storeKey: string, productId: string, rawCode: string): Promise<VoucherPreview> {
  const code = normaliseCode(rawCode);
  if (!code) return { ok: false, error: "Masukkan kode voucher." };
  if (!(await allow("voucher"))) return { ok: false, error: "Terlalu banyak percobaan. Coba lagi nanti." };
  const store = await getStore(storeKey);
  if (!store || !TIERS[store.tier].vouchers) return { ok: false, error: "Kode voucher tidak ditemukan." };
  const product = await getPublishedProduct(store.id, productId);
  if (!product) return { ok: false, error: "Produk tidak ditemukan." };
  const res = evaluateVoucher(toVoucher(await voucherRef(store.id, code).get()), {
    storeId: store.id,
    productId: product.id,
    amount: priceFor(product, store.tier).price,
  });
  return res.ok ? { ok: true, code, discount: res.discount, total: res.total } : res;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;


export async function startCheckout(storeKey: string, productId: string, _prev: CheckoutState, form: FormData): Promise<CheckoutState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const phoneRaw = String(form.get("phone") ?? "").trim();
  const voucherCode = normaliseCode(String(form.get("voucher") ?? ""));
  const echo = { email, phone: phoneRaw, voucher: voucherCode };

  if (!EMAIL_RE.test(email)) return { ...echo, error: "Email tidak valid." };
  if (!(await allow("checkout"))) return { ...echo, error: "Terlalu banyak percobaan checkout. Coba lagi dalam beberapa menit." };
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
  const price = priceFor(product, store.tier).price;
  const useVoucher = !!voucherCode && TIERS[store.tier].vouchers;
  const ref = (await cookies()).get("ref")?.value ?? null;
  // Signed-in buyers: the order joins their history, and their WhatsApp is remembered.
  const customer = await getCustomer();
  const channelRaw = form.get("channel");
  const channel = isPaymentChannel(channelRaw) ? channelRaw : null;
  const orderId = newOrderId();
  const orderRef = adminDb.collection("orders").doc(orderId);
  // Price, title and store come from the database, never from the form. The voucher's quota
  // is claimed in the same transaction that creates the order, so two buyers can't take the
  // last use, and a refused voucher creates no order.
  const outcome = await adminDb.runTransaction(async (tx) => {
    let discount = 0;
    if (useVoucher) {
      const vRef = voucherRef(store.id, voucherCode);
      const check = evaluateVoucher(toVoucher(await tx.get(vRef)), { storeId: store.id, productId: product.id, amount: price });
      if (!check.ok) return { error: check.error };
      discount = check.discount;
      tx.update(vRef, { used_count: FieldValue.increment(1) });
    }
    const amount = price - discount;
    tx.create(orderRef, {
      store_id: store.id,
      product_id: product.id,
      product_title: product.title,
      amount,
      voucher_code: useVoucher ? voucherCode : null,
      discount,
      credential_id: null,
      customer_contact: { email, phone },
      ...(customer ? { customer_uid: customer.uid } : {}),
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
    return { amount };
  });
  if ("error" in outcome) return { ...echo, error: outcome.error };
  const { amount } = outcome;

  if (customer && customer.phone !== phone) {
    await adminDb.collection("customers").doc(customer.uid).update({ phone });
  }

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
      channel,
    });
    await orderRef.update({ xendit_invoice_id: invoice.id, xendit_invoice_url: invoice.invoice_url, settlement: invoice.settlement });
    return { redirect: invoice.invoice_url };
  } catch (err) {
    console.error(err);
    await failAndReleaseVoucher(orderRef);
    return { ...echo, error: "Gagal membuat tagihan pembayaran. Silakan coba lagi." };
  }
}

/** No invoice, no sale: the order fails and its voucher use goes back to the quota. */
async function failAndReleaseVoucher(orderRef: FirebaseFirestore.DocumentReference) {
  await adminDb.runTransaction(async (tx) => {
    const order = await tx.get(orderRef);
    if (order.get("payment_status") !== "PENDING") return;
    const code = order.get("voucher_code") as string | null;
    const vRef = code ? voucherRef(order.get("store_id"), code) : null;
    const voucher = vRef ? await tx.get(vRef) : null;
    tx.update(orderRef, { payment_status: "FAILED" });
    if (vRef && voucher?.exists && (voucher.get("used_count") ?? 0) > 0) tx.update(vRef, { used_count: FieldValue.increment(-1) });
  });
}
