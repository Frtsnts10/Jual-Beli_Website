import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

// Same rules as the dashboard's lib/payments/manual.ts (keep in sync). Run here before a
// checkout or voucher check, so a voucher use held by an abandoned order comes back right
// away instead of waiting for the seller to open Pesanan or the nightly cron.

async function failOrder(orderId: string, reason: string): Promise<boolean> {
  const orderRef = adminDb.collection("orders").doc(orderId);
  return adminDb.runTransaction(async (tx) => {
    const order = await tx.get(orderRef);
    if (!order.exists || order.get("payment_status") !== "PENDING" || order.get("proof_uploaded_at")) return false;
    // In a cart several orders carry the code but only one holds the use (voucher_use).
    const code = (order.get("voucher_use") ?? !order.get("group_id")) ? (order.get("voucher_code") as string | null) : null;
    const voucherRef = code ? adminDb.collection("vouchers").doc(`${order.get("store_id")}_${code}`) : null;
    const voucher = voucherRef ? await tx.get(voucherRef) : null;
    tx.update(orderRef, { payment_status: "FAILED", rejected_reason: reason, failed_at: FieldValue.serverTimestamp() });
    if (voucherRef && voucher?.exists && (voucher.get("used_count") ?? 0) > 0) tx.update(voucherRef, { used_count: FieldValue.increment(-1) });
    return true;
  });
}

/** Fails this store's unpaid orders whose pay-by time passed without a proof. Never throws. */
export async function expireUnpaidOrders(storeId: string): Promise<void> {
  try {
    const snap = await adminDb
      .collection("orders")
      .where("payment_status", "==", "PENDING")
      .where("store_id", "==", storeId)
      .where("pay_by", "<", Timestamp.now())
      .limit(50)
      .get();
    for (const d of snap.docs) if (!d.get("proof_uploaded_at")) await failOrder(d.id, "Tidak dibayar sebelum batas waktu");
  } catch (err) {
    console.error("expireUnpaidOrders failed", err); // housekeeping only; checkout goes on
  }
}
