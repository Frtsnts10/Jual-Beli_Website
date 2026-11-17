// Cart arithmetic shared by the voucher preview and the checkout transaction. Pure.
import { evaluateVoucher, type Voucher, type VoucherCheck } from "@/lib/voucher";

export interface CartLine {
  productId: string;
  /** Price of one unit (flash sale applied), from the server. */
  price: number;
}

/** Most units of one product per checkout (each unit is its own order and account). */
export const MAX_QTY = 10;
/** Most separate lines (orders) in one checkout. */
export const MAX_LINES = 20;

export type CartItemInput = { id: string; qty: number };

/** Cleans what the browser sent: known shape, positive whole quantities, duplicates merged. */
export function normaliseItems(raw: unknown): CartItemInput[] {
  if (!Array.isArray(raw)) return [];
  const merged = new Map<string, number>();
  for (const it of raw) {
    if (!it || typeof it !== "object") continue;
    const id = String((it as { id?: unknown }).id ?? "");
    const qty = Math.floor(Number((it as { qty?: unknown }).qty));
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(id) || !Number.isFinite(qty) || qty < 1) continue;
    merged.set(id, Math.min(MAX_QTY, (merged.get(id) ?? 0) + qty));
  }
  return [...merged].map(([id, qty]) => ({ id, qty }));
}

/**
 * A voucher on a cart: it applies to the lines it is valid for (all of them for a store-wide
 * voucher), as one use, against their combined price.
 */
export function evaluateCartVoucher(v: Voucher | null, storeId: string, lines: CartLine[], now = new Date()): VoucherCheck {
  const eligible = v?.product_ids ? lines.filter((l) => v.product_ids!.includes(l.productId)) : lines;
  if (v && v.store_id === storeId && v.active && eligible.length === 0)
    return {
      ok: false,
      error: "Voucher tidak berlaku untuk produk di keranjang.",
    };
  const subtotal = eligible.reduce((s, l) => s + l.price, 0);
  return evaluateVoucher(v, { storeId, productId: eligible[0]?.productId ?? "", amount: subtotal }, now);
}

/**
 * Splits a cart discount over the lines it applies to, in proportion to their price (whole
 * rupiah, remainder to the most expensive lines), so each order records its own share and
 * the shares add up exactly. Lines the voucher doesn't cover get 0.
 */
export function allocateDiscount(lines: CartLine[], discount: number, productIds: string[] | null): number[] {
  const eligible = lines.map((l) => !productIds || productIds.includes(l.productId));
  const base = lines.reduce((s, l, i) => s + (eligible[i] ? l.price : 0), 0);
  if (discount <= 0 || base <= 0) return lines.map(() => 0);
  const exact = lines.map((l, i) => (eligible[i] ? (discount * l.price) / base : 0));
  const shares = exact.map(Math.floor);
  let left = discount - shares.reduce((s, x) => s + x, 0);
  const order = lines.map((_, i) => i).sort((a, b) => exact[b] - shares[b] - (exact[a] - shares[a]) || lines[b].price - lines[a].price);
  for (const i of order) {
    if (left <= 0) break;
    if (!eligible[i]) continue;
    shares[i]++;
    left--;
  }
  return shares;
}
