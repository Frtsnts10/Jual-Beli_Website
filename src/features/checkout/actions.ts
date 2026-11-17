"use server";

import { cookies } from "next/headers";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { getPublishedProduct, getStore, storeLinker, type PublicStore, type StoreProductData } from "@/lib/stores";
import { newOrderId } from "@/lib/order-id";
import { getCustomer } from "@/lib/customer";
import { TIERS } from "@/config/tiers";
import { priceFor } from "@/lib/pricing";
import { allow } from "@/lib/rate-limit";
import { normalisePhone } from "@/lib/phone";
import { normaliseCode } from "@/lib/voucher";
import { allocateDiscount, evaluateCartVoucher, MAX_LINES, normaliseItems, type CartItemInput, type CartLine } from "@/lib/cart-math";
import { toVoucher, voucherRef } from "@/lib/vouchers-server";
import { expireUnpaidOrders } from "@/lib/expire-orders";

export type CheckoutState =
  | {
      error?: string;
      email?: string;
      phone?: string;
      voucher?: string;
      redirect?: string;
    }
  | undefined;

export type VoucherPreview = { ok: true; code: string; discount: number; total: number } | { ok: false; error: string };

/** "Pakai" button: shows the discount before paying. The real check repeats inside checkout. */
export async function checkVoucher(storeKey: string, rawItems: CartItemInput[], rawCode: string): Promise<VoucherPreview> {
  const code = normaliseCode(rawCode);
  if (!code) return { ok: false, error: "Masukkan kode voucher." };
  if (!(await allow("voucher"))) return { ok: false, error: "Terlalu banyak percobaan. Coba lagi nanti." };
  const store = await getStore(storeKey);
  if (!store || !TIERS[store.tier].vouchers) return { ok: false, error: "Kode voucher tidak ditemukan." };
  const lines = await cartLines(store, normaliseItems(rawItems));
  if (typeof lines === "string") return { ok: false, error: lines };
  await expireUnpaidOrders(store.id); // frees voucher uses held by abandoned orders
  const res = evaluateCartVoucher(toVoucher(await voucherRef(store.id, code).get()), store.id, lines);
  return res.ok
    ? {
        ok: true,
        code,
        discount: res.discount,
        total: lines.reduce((s, l) => s + l.price, 0) - res.discount,
      }
    : res;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Line = CartLine & { product: StoreProductData };

/** One line per unit, priced on the server; an error message if something can't be bought. */
async function cartLines(store: PublicStore, items: CartItemInput[]): Promise<Line[] | string> {
  if (items.length === 0) return "Keranjang kosong.";
  const lines: Line[] = [];
  for (const it of items) {
    const product = await getPublishedProduct(store.id, it.id);
    if (!product) return "Ada produk di keranjang yang sudah tidak dijual. Hapus dulu dari keranjang.";
    if (product.stock_available < it.qty) {
      return product.stock_available < 1 ? `Maaf, stok ${product.title} sedang habis.` : `Stok ${product.title} tinggal ${product.stock_available}.`;
    }
    const price = priceFor(product, store.tier).price;
    for (let i = 0; i < it.qty; i++) lines.push({ productId: product.id, price, product });
  }
  if (lines.length > MAX_LINES) return `Maksimal ${MAX_LINES} item per checkout.`;
  return lines;
}

/** Checkout of one product ("Beli Langsung") or a whole cart: one QRIS payment either way. */
export async function startCheckout(storeKey: string, rawItems: CartItemInput[], _prev: CheckoutState, form: FormData): Promise<CheckoutState> {
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const phoneRaw = String(form.get("phone") ?? "").trim();
  const voucherCode = normaliseCode(String(form.get("voucher") ?? ""));
  const echo = { email, phone: phoneRaw, voucher: voucherCode };

  if (!EMAIL_RE.test(email)) return { ...echo, error: "Email tidak valid." };
  if (!(await allow("checkout", email)) || !(await allow("checkoutIp"))) return { ...echo, error: "Terlalu banyak percobaan checkout. Coba lagi dalam beberapa menit." };
  const phone = normalisePhone(phoneRaw);
  if (!phone) return { ...echo, error: "Nomor WhatsApp tidak valid (contoh: 0812xxxxxxx)." };

  const store = await getStore(storeKey);
  if (!store || !store.is_active) return { ...echo, error: "Toko tidak tersedia." };
  const lines = await cartLines(store, normaliseItems(rawItems));
  if (typeof lines === "string") return { ...echo, error: lines };

  // Payment goes straight to the seller's own QRIS; without one there is nothing to pay into.
  if (!store.payment) return { ...echo, error: "Toko ini belum mengatur pembayaran QRIS. Hubungi penjual." };
  if (voucherCode) await expireUnpaidOrders(store.id); // frees voucher uses held by abandoned orders

  const useVoucher = !!voucherCode && TIERS[store.tier].vouchers;
  const ref = (await cookies()).get("ref")?.value ?? null;
  // Signed-in buyers: the orders join their history, and their WhatsApp is remembered.
  const customer = await getCustomer();
  // One order per unit (each gets its own account, warranty and review). The first is the
  // group's lead: its id is the payment page, the proof and the voucher use.
  const orderIds = lines.map(() => newOrderId());
  const groupId = orderIds[0];

  // Prices, titles and store come from the database, never from the form. The voucher's quota
  // is claimed in the same transaction that creates the orders, so two buyers can't take the
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
          .select("amount", "group_total", "product_id", "pay_by", "proof_uploaded_at"),
      ),
    ]);
    // Unpaid orders still in their pay window (or with a proof waiting for the seller) hold
    // their stock: without this, two buyers could both pay for the last account.
    const now = Date.now();
    const holding = open.docs.filter((d) => d.get("proof_uploaded_at") || (d.get("pay_by")?.toMillis?.() ?? 0) > now);
    const componentsOfLine = (p: StoreProductData) => (p.bundle_items?.length ? p.bundle_items : [p.id]);
    const wanted = new Map<string, number>();
    for (const l of lines) for (const c of componentsOfLine(l.product)) wanted.set(c, (wanted.get(c) ?? 0) + 1);
    const productIds = [...new Set([...wanted.keys(), ...holding.map((d) => d.get("product_id") as string)])];
    const productSnaps = await tx.getAll(...productIds.map((id) => adminDb.collection("products").doc(id)));
    const byId = new Map(productSnaps.map((p) => [p.id, p]));
    const componentsOf = (id: string) => (byId.get(id)?.get("bundle_items") as string[] | null)?.length ? (byId.get(id)!.get("bundle_items") as string[]) : [id];
    const reserved = new Map<string, number>();
    for (const d of holding) for (const c of componentsOf(d.get("product_id"))) reserved.set(c, (reserved.get(c) ?? 0) + 1);
    for (const [c, n] of wanted) {
      const free = ((byId.get(c)?.get("stock_available") as number) ?? 0) - (reserved.get(c) ?? 0);
      if (free < n) {
        const title = lines.find((l) => componentsOfLine(l.product).includes(c))?.product.title ?? "produk ini";
        return {
          error:
            free < 1
              ? `Stok terakhir ${title} sedang dipesan pembeli lain yang belum bayar. Jika tidak dibayar, stok kembali dalam maksimal 60 menit — coba lagi nanti.`
              : `Stok ${title} yang bisa dipesan tinggal ${free}. Kurangi jumlahnya di keranjang.`,
        };
      }
    }

    let discount = 0;
    let voucherProducts: string[] | null = null;
    if (vRef) {
      const voucher = toVoucher(voucherSnap!);
      const check = evaluateCartVoucher(voucher, store.id, lines);
      if (!check.ok) return { error: check.error };
      discount = check.discount;
      voucherProducts = voucher!.product_ids;
      tx.update(vRef, { used_count: FieldValue.increment(1) });
    }
    const shares = allocateDiscount(lines, discount, voucherProducts);
    // The one order that holds the voucher use: cancelling the checkout gives it back once.
    const voucherHolder = shares.findIndex((x) => x > 0);
    const subtotal = lines.reduce((s, l) => s + l.price, 0);
    // Kode unik: a few rupiah on top so the seller can match each QRIS transfer to its checkout.
    const taken = new Set(open.docs.map((d) => (d.get("group_total") as number | undefined) ?? (d.get("amount") as number)));
    const uniqueCode = pickUniqueCode(subtotal - discount, taken);
    const total = subtotal - discount + uniqueCode;
    const payBy = Timestamp.fromMillis(Date.now() + PAY_WINDOW_MS);
    lines.forEach((l, i) => {
      const lead = i === 0;
      tx.create(adminDb.collection("orders").doc(orderIds[i]), {
        store_id: store.id,
        product_id: l.product.id,
        product_title: l.product.title,
        amount: l.price - shares[i] + (lead ? uniqueCode : 0),
        unique_code: lead ? uniqueCode : 0,
        voucher_code: useVoucher && shares[i] > 0 ? voucherCode : null,
        voucher_use: useVoucher && i === voucherHolder,
        discount: shares[i],
        group_id: groupId,
        group_size: lines.length,
        group_total: total,
        credential_id: null,
        customer_contact: { email, phone },
        ...(customer ? { customer_uid: customer.uid } : {}),
        payment_status: "PENDING",
        payment_method: "QRIS",
        pay_by: payBy,
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
    });
    return { total };
  });
  if ("error" in outcome) return { ...echo, error: outcome.error };

  if (customer && customer.phone !== phone) {
    await adminDb.collection("customers").doc(customer.uid).update({ phone });
  }
  const link = await storeLinker(storeKey);
  return { redirect: link(`/bayar/${groupId}`) };
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
