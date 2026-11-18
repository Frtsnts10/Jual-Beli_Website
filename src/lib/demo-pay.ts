import "server-only";
import { FieldValue, Timestamp, type DocumentSnapshot, type Transaction } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

// Demo store only: lets a visitor see the "paid" flow without a real QRIS transfer.
// Same allocation as the dashboard's fulfillOrder (lib/payments/fulfillment.ts) — keep in sync.

/** The seeded demo store (scripts/seed-demo.mjs in the dashboard). Nowhere else can skip payment. */
export const DEMO_STORE_ID = "demo-dionycte";

const DAY_MS = 24 * 60 * 60 * 1000;

const componentsOf = (product: DocumentSnapshot): string[] => {
  const items = product.get("bundle_items") as string[] | null | undefined;
  return items?.length ? items : [product.id];
};

async function pickCredentials(tx: Transaction, componentIds: string[]) {
  const picks: { component: DocumentSnapshot; credential: DocumentSnapshot }[] = [];
  for (const id of componentIds) {
    const [component, available] = await Promise.all([
      tx.get(adminDb.collection("products").doc(id)),
      tx.get(adminDb.collection("credentials_vault").where("product_id", "==", id).where("status", "==", "AVAILABLE").limit(1)),
    ]);
    if (!available.docs[0]) return null;
    picks.push({ component, credential: available.docs[0] });
  }
  return picks;
}

/** PAID + one credential per bundle component, in one transaction (needs_stock if the vault is empty). */
export async function fulfillDemoOrder(orderId: string) {
  const orderRef = adminDb.collection("orders").doc(orderId);
  return adminDb.runTransaction(async (tx) => {
    const order = await tx.get(orderRef);
    if (!order.exists || order.get("store_id") !== DEMO_STORE_ID || order.get("payment_status") !== "PENDING") return "skipped";
    const product = await tx.get(adminDb.collection("products").doc(order.get("product_id")));
    const picks = await pickCredentials(tx, componentsOf(product));
    const now = Timestamp.now();
    const paid = { payment_status: "PAID", paid_at: now, demo_paid: true };
    if (!picks) {
      tx.update(orderRef, { ...paid, needs_stock: true });
      return "needs_stock";
    }
    let accessUntil: Timestamp | null = null;
    for (const { component, credential } of picks) {
      const days = (component.get("duration_days") as number | undefined) ?? 30;
      const expiry: Timestamp = credential.get("expiry_date") ?? Timestamp.fromMillis(now.toMillis() + days * DAY_MS);
      if (!accessUntil || expiry.toMillis() < accessUntil.toMillis()) accessUntil = expiry;
      tx.update(credential.ref, { status: "SOLD", order_id: orderId, sold_at: now, expiry_date: expiry });
      tx.update(component.ref, { stock_available: FieldValue.increment(-1) });
    }
    const ids = picks.map((p) => p.credential.id);
    tx.update(orderRef, { ...paid, credential_id: ids[0], credential_ids: ids, needs_stock: false, access_expires_at: accessUntil });
    return "fulfilled";
  });
}
