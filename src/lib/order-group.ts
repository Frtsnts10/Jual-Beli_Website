import "server-only";
import { adminDb } from "@/lib/firebase/admin";

// A checkout (one product or a whole cart) is a group of orders paid with one QRIS transfer.
// The first order is the lead: its id is the group id (payment page, proof, voucher use).
// Orders from before carts have no group_id and are a group of one.

export const groupIdOf = (order: FirebaseFirestore.DocumentSnapshot) => (order.get("group_id") as string | undefined) ?? order.id;

/** The orders of a group, lead first. */
export async function groupOrders(
  lead: FirebaseFirestore.DocumentSnapshot,
): Promise<FirebaseFirestore.QueryDocumentSnapshot[] | FirebaseFirestore.DocumentSnapshot[]> {
  if (!lead.get("group_id") || (lead.get("group_size") ?? 1) <= 1) return [lead];
  const snap = await adminDb.collection("orders").where("group_id", "==", lead.id).get();
  return snap.docs.filter((d) => d.get("store_id") === lead.get("store_id")).sort((a, b) => (a.id === lead.id ? -1 : b.id === lead.id ? 1 : 0));
}

/** What the buyer pays for the whole group. */
export const groupTotal = (lead: FirebaseFirestore.DocumentSnapshot) => (lead.get("group_total") as number | undefined) ?? (lead.get("amount") as number);
