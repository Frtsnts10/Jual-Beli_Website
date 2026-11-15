/**
 * One reading of an order's payment state for every buyer-facing page (Akun, Lacak, Bayar),
 * so they never disagree. A PENDING order is "awaiting payment" until its pay-by time,
 * "awaiting confirmation" once a proof is in, and "expired" when the time ran out without a
 * proof — even before the nightly/lazy expiry has actually marked it FAILED.
 */
export type PayState = "AWAITING_PAYMENT" | "AWAITING_CONFIRMATION" | "EXPIRED" | "PAID" | "FAILED";

export function payState(o: { payment_status: string; proof_uploaded_at: string | null; pay_by: string | null }, now = Date.now()): PayState {
  if (o.payment_status === "PAID") return "PAID";
  if (o.payment_status !== "PENDING") return "FAILED";
  if (o.proof_uploaded_at) return "AWAITING_CONFIRMATION";
  if (o.pay_by && new Date(o.pay_by).getTime() < now) return "EXPIRED";
  return "AWAITING_PAYMENT";
}

export const PAY_STATE: Record<PayState, { label: string; tone: string }> = {
  AWAITING_PAYMENT: { label: "Menunggu pembayaran", tone: "bg-amber-50 text-amber-700" },
  AWAITING_CONFIRMATION: { label: "Menunggu konfirmasi penjual", tone: "bg-sky-50 text-sky-700" },
  EXPIRED: { label: "Kedaluwarsa", tone: "bg-neutral-100 text-neutral-600" },
  PAID: { label: "Lunas", tone: "bg-emerald-50 text-emerald-700" },
  FAILED: { label: "Dibatalkan", tone: "bg-red-50 text-red-700" },
};

/** The buyer can still pay (or check the pay page) only while it's awaiting payment or confirmation. */
export const canOpenPayPage = (s: PayState) => s === "AWAITING_PAYMENT" || s === "AWAITING_CONFIRMATION";
