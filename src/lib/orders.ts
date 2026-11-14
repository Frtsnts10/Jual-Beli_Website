import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { getOwnReviews, type OwnReview } from "@/lib/reviews";

export interface TrackedOrder {
  id: string;
  product_id: string;
  product_title: string;
  amount: number;
  payment_status: string;
  delivery_status: string;
  warranty_status: string;
  created_at: string;
  paid_at: string | null;
  access_expires_at: string | null;
}

const iso = (v: unknown) => (v && typeof v === "object" && "toDate" in v ? (v as { toDate(): Date }).toDate().toISOString() : null);

export function toTracked(snap: FirebaseFirestore.DocumentSnapshot): TrackedOrder {
  return {
    id: snap.id,
    product_id: snap.get("product_id") ?? "",
    product_title: snap.get("product_title"),
    amount: snap.get("amount"),
    payment_status: snap.get("payment_status"),
    delivery_status: snap.get("delivery_status"),
    warranty_status: snap.get("warranty_status"),
    created_at: iso(snap.get("created_at")) ?? "",
    paid_at: iso(snap.get("paid_at")),
    access_expires_at: iso(snap.get("access_expires_at")),
  };
}

/**
 * Files a warranty claim on an order the caller has already proven ownership of (ID + email
 * on the track page, or the signed-in account). Returns an error message, or null on success.
 */
export async function fileClaim(snap: FirebaseFirestore.DocumentSnapshot, reasonRaw: string): Promise<string | null> {
  const order = toTracked(snap);
  const reason = reasonRaw.trim();
  if (reason.length < 10) return "Jelaskan masalahnya (minimal 10 karakter).";
  if (order.payment_status !== "PAID") return "Pesanan belum lunas.";
  if (order.warranty_status === "CLAIMED") return "Klaim Anda sedang diproses penjual.";
  if (order.access_expires_at && new Date(order.access_expires_at) < new Date()) return "Masa aktif akun sudah habis, garansi tidak berlaku.";
  await snap.ref.update({
    warranty_status: "CLAIMED",
    warranty_claim: { reason: reason.slice(0, 500), claimed_at: FieldValue.serverTimestamp() },
  });
  return null;
}

/**
 * Orders placed on this store as a guest with the buyer's (verified) email become theirs.
 * Only for verified emails, so registering someone else's address reveals nothing.
 */
async function linkGuestOrders(storeId: string, uid: string, email: string) {
  const snap = await adminDb.collection("orders").where("store_id", "==", storeId).where("customer_contact.email", "==", email).get();
  const unlinked = snap.docs.filter((d) => !d.get("customer_uid"));
  for (let i = 0; i < unlinked.length; i += 400) {
    const batch = adminDb.batch();
    unlinked.slice(i, i + 400).forEach((d) => batch.update(d.ref, { customer_uid: uid }));
    await batch.commit();
  }
}

export type AccountOrder = TrackedOrder & { claim_reason: string | null; review: OwnReview | null };

/** The buyer's orders on one store, newest first (history is per store by design). */
export async function listCustomerOrders(storeId: string, customer: { uid: string; email: string; email_verified: boolean }): Promise<AccountOrder[]> {
  if (customer.email_verified && customer.email) await linkGuestOrders(storeId, customer.uid, customer.email);
  const snap = await adminDb
    .collection("orders")
    .where("store_id", "==", storeId)
    .where("customer_uid", "==", customer.uid)
    .orderBy("created_at", "desc")
    .limit(100)
    .get();
  const reviews = await getOwnReviews(
    snap.docs.filter((d) => d.get("payment_status") === "PAID").map((d) => d.id),
    customer.uid
  );
  return snap.docs.map((d) => ({
    ...toTracked(d),
    claim_reason: (d.get("warranty_claim.reason") as string) ?? null,
    review: reviews.get(d.id) ?? null,
  }));
}
