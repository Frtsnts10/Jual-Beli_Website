"use server";

import { cookies } from "next/headers";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { getPublishedProduct, getStore, storeLinker } from "@/lib/stores";
import { newOrderId } from "@/lib/order-id";
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

  // Payment goes straight to the seller's own QRIS; without one there is nothing to pay into.
  if (!store.payment) return { ...echo, error: "Toko ini belum mengatur pembayaran QRIS. Hubungi penjual." };

  // Flash-sale price if a sale is running right now; always computed on the server.
  const price = priceFor(product, store.tier).price;
  const useVoucher = !!voucherCode && TIERS[store.tier].vouchers;
  const ref = (await cookies()).get("ref")?.value ?? null;
  // Signed-in buyers: the order joins their history, and their WhatsApp is remembered.
  const customer = await getCustomer();
  const orderId = newOrderId();
  const orderRef = adminDb.collection("orders").doc(orderId);

  // Price, title and store come from the database, never from the form. The voucher's quota
  // is claimed in the same transaction that creates the order, so two buyers can't take the
  // last use, and a refused voucher creates no order.
  const outcome = await adminDb.runTransaction(async (tx) => {
    // All reads first (Firestore transactions require it), then the writes.
    const vRef = useVoucher ? voucherRef(store.id, voucherCode) : null;
    const [voucherSnap, open] = await Promise.all([
      vRef ? tx.get(vRef) : null,
      tx.get(
        adminDb
          .collection("orders")
          .where("store_id", "==", store.id)
          .where("payment_status", "==", "PENDING")
          .select("amount", "product_id", "pay_by", "proof_uploaded_at")
      ),
    ]);
    // Unpaid orders still in their pay window (or with a proof waiting for the seller) hold
    // their stock: without this, two buyers could both pay for the last account.
    const now = Date.now();
    const holding = open.docs.filter((d) => d.get("proof_uploaded_at") || (d.get("pay_by")?.toMillis?.() ?? 0) > now);
    const ownComponents = product.bundle_items?.length ? product.bundle_items : [product.id];
    const productIds = [...new Set([...ownComponents, ...holding.map((d) => d.get("product_id") as string)])];
    const productSnaps = await tx.getAll(...productIds.map((id) => adminDb.collection("products").doc(id)));
    const byId = new Map(productSnaps.map((p) => [p.id, p]));
    const componentsOf = (id: string) => (byId.get(id)?.get("bundle_items") as string[] | null)?.length ? (byId.get(id)!.get("bundle_items") as string[]) : [id];
    const reserved = new Map<string, number>();
    for (const d of holding) for (const c of componentsOf(d.get("product_id"))) reserved.set(c, (reserved.get(c) ?? 0) + 1);
    const free = Math.min(...ownComponents.map((c) => ((byId.get(c)?.get("stock_available") as number) ?? 0) - (reserved.get(c) ?? 0)));
    if (free < 1) return { error: "Stok terakhir sedang dipesan pembeli lain yang belum bayar. Jika tidak dibayar, stok kembali dalam maksimal 60 menit — coba lagi nanti." };

    let discount = 0;
    if (vRef) {
      const check = evaluateVoucher(toVoucher(voucherSnap!), { storeId: store.id, productId: product.id, amount: price });
      if (!check.ok) return { error: check.error };
      discount = check.discount;
      tx.update(vRef, { used_count: FieldValue.increment(1) });
    }
    // Kode unik: a few rupiah on top so the seller can match each QRIS transfer to its order.
    const uniqueCode = pickUniqueCode(price - discount, new Set(open.docs.map((d) => d.get("amount") as number)));
    const amount = price - discount + uniqueCode;
    tx.create(orderRef, {
      store_id: store.id,
      product_id: product.id,
      product_title: product.title,
      amount,
      unique_code: uniqueCode,
      voucher_code: useVoucher ? voucherCode : null,
      discount,
      credential_id: null,
      customer_contact: { email, phone },
      ...(customer ? { customer_uid: customer.uid } : {}),
      payment_status: "PENDING",
      payment_method: "QRIS",
      pay_by: Timestamp.fromMillis(Date.now() + PAY_WINDOW_MS),
      proof_uploaded_at: null,
      rejected_reason: null,
      delivery_status: "PENDING",
      warranty_status: "VALID",
      warranty_claim: null,
      needs_stock: false,
      renewal_notified: false,
      referral_code: ref,
      created_at: FieldValue.serverTimestamp(),
      paid_at: null,
      access_expires_at: null,
    });
    return { amount };
  });
  if ("error" in outcome) return { ...echo, error: outcome.error };

  if (customer && customer.phone !== phone) {
    await adminDb.collection("customers").doc(customer.uid).update({ phone });
  }
  const link = await storeLinker(storeKey);
  return { redirect: link(`/bayar/${orderId}`) };
}

/** Buyers have this long to pay and upload the proof before the order is cancelled. */
const PAY_WINDOW_MS = 60 * 60 * 1000;

/** 1–499 rupiah, avoiding totals already waiting for payment in this store. */
function pickUniqueCode(base: number, taken: Set<number>) {
  for (let i = 0; i < 50; i++) {
    const code = 1 + Math.floor(Math.random() * 499);
    if (!taken.has(base + code)) return code;
  }
  return 1 + Math.floor(Math.random() * 499);
}
