// Voucher rules — identical copy in the storefront repo (src/lib/voucher.ts); keep both in sync.
// Pure: no Firestore here, so the same check runs in the checkout transaction and in tests.

import { formatIDR } from "@/lib/utils";

export type VoucherType = "percent" | "fixed";

/** vouchers/{storeId}_{CODE} */
export interface Voucher {
  store_id: string;
  code: string;
  type: VoucherType;
  /** Percent (1–100) or rupiah. */
  value: number;
  /** Percent vouchers only: the most a single order can be discounted (null = no cap). */
  max_discount: number | null;
  /** Order price (after flash sale) must be at least this. */
  min_amount: number;
  /** null = unlimited. */
  max_uses: number | null;
  used_count: number;
  /** ISO string or null (never expires). */
  expires_at: string | null;
  /** Only these products, or null for the whole store. */
  product_ids: string[] | null;
  active: boolean;
}

/** Xendit refuses invoices below this, so a discount never takes an order under it. */
export const MIN_PAYABLE = 1_000;

export const CODE_RE = /^[A-Z0-9]{3,20}$/;
export const normaliseCode = (raw: string) => raw.trim().toUpperCase().replace(/\s+/g, "");
export const voucherDocId = (storeId: string, code: string) => `${storeId}_${code}`;

export type VoucherCheck = { ok: true; discount: number; total: number } | { ok: false; error: string };

export function evaluateVoucher(v: Voucher | null, order: { storeId: string; productId: string; amount: number }, now = new Date()): VoucherCheck {
  if (!v || v.store_id !== order.storeId || !v.active) return { ok: false, error: "Kode voucher tidak ditemukan." };
  if (v.expires_at && new Date(v.expires_at) <= now) return { ok: false, error: "Voucher sudah kedaluwarsa." };
  if (v.max_uses !== null && v.used_count >= v.max_uses) return { ok: false, error: "Kuota voucher sudah habis." };
  if (v.product_ids && !v.product_ids.includes(order.productId)) return { ok: false, error: "Voucher tidak berlaku untuk produk ini." };
  if (order.amount < v.min_amount) return { ok: false, error: `Minimal belanja ${formatIDR(v.min_amount)} untuk voucher ini.` };

  let discount = v.type === "percent" ? Math.floor((order.amount * Math.min(Math.max(v.value, 0), 100)) / 100) : Math.max(v.value, 0);
  if (v.type === "percent" && v.max_discount !== null) discount = Math.min(discount, v.max_discount);
  discount = Math.min(discount, Math.max(order.amount - MIN_PAYABLE, 0));
  if (discount <= 0) return { ok: false, error: "Voucher tidak memberi potongan untuk pesanan ini." };
  return { ok: true, discount, total: order.amount - discount };
}

/** "10% (maks Rp 20.000)" / "Rp 15.000" */
export function describeVoucher(v: Pick<Voucher, "type" | "value" | "max_discount">) {
  if (v.type === "fixed") return formatIDR(v.value);
  return `${v.value}%${v.max_discount ? ` (maks ${formatIDR(v.max_discount)})` : ""}`;
}
