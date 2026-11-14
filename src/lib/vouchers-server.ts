import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { voucherDocId, type Voucher } from "@/lib/voucher";

export const voucherRef = (storeId: string, code: string) => adminDb.collection("vouchers").doc(voucherDocId(storeId, code));

export function toVoucher(snap: FirebaseFirestore.DocumentSnapshot): Voucher | null {
  if (!snap.exists) return null;
  const d = snap.data()!;
  const exp = d.expires_at;
  return {
    store_id: d.store_id,
    code: d.code,
    type: d.type === "fixed" ? "fixed" : "percent",
    value: Number(d.value) || 0,
    max_discount: typeof d.max_discount === "number" ? d.max_discount : null,
    min_amount: Number(d.min_amount) || 0,
    max_uses: typeof d.max_uses === "number" ? d.max_uses : null,
    used_count: Number(d.used_count) || 0,
    expires_at: exp && typeof exp === "object" && "toDate" in exp ? exp.toDate().toISOString() : null,
    product_ids: Array.isArray(d.product_ids) ? d.product_ids : null,
    active: d.active !== false,
  };
}
