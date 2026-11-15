import "server-only";
import { cache } from "react";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { reviewerName } from "@/lib/rating";

const iso = (v: unknown) => (v && typeof v === "object" && "toDate" in v ? (v as { toDate(): Date }).toDate().toISOString() : "");

export interface PublicReview {
  id: string;
  name: string;
  rating: number;
  text: string;
  created_at: string;
}

/** Newest visible reviews of one product (the full star breakdown lives on the product). */
export const getProductReviews = cache(async (storeId: string, productId: string, limit = 30): Promise<PublicReview[]> => {
  const snap = await adminDb
    .collection("reviews")
    .where("product_id", "==", productId)
    .where("hidden", "==", false)
    .orderBy("created_at", "desc")
    .limit(limit)
    .get();
  return snap.docs
    .filter((d) => d.get("store_id") === storeId)
    .map((d) => ({ id: d.id, name: d.get("name") ?? "Pembeli", rating: d.get("rating"), text: d.get("text") ?? "", created_at: iso(d.get("created_at")) }));
});

export interface OwnReview {
  rating: number;
  text: string;
  hidden: boolean;
}

/** The buyer's own reviews for a set of their orders, keyed by order id. */
export async function getOwnReviews(orderIds: string[], uid: string): Promise<Map<string, OwnReview>> {
  if (!orderIds.length) return new Map();
  const snaps = await adminDb.getAll(...orderIds.map((id) => adminDb.collection("reviews").doc(id)));
  return new Map(
    snaps
      .filter((s) => s.exists && s.get("customer_uid") === uid)
      .map((s) => [s.id, { rating: s.get("rating"), text: s.get("text") ?? "", hidden: !!s.get("hidden") }])
  );
}

/**
 * Creates or edits the review of one order, keeping products.rating in step: the old star
 * (if it was counted) goes out, the new one comes in. A review the seller hid stays hidden.
 */
export async function writeReview(order: FirebaseFirestore.DocumentSnapshot, buyerName: string, rating: number, text: string) {
  const reviewRef = adminDb.collection("reviews").doc(order.id);
  const productRef = adminDb.collection("products").doc(order.get("product_id"));
  await adminDb.runTransaction(async (tx) => {
    const [prev, product] = await Promise.all([tx.get(reviewRef), tx.get(productRef)]);
    const hidden = prev.exists && !!prev.get("hidden");
    if (product.exists && !hidden) {
      const old = prev.exists ? Number(prev.get("rating")) : null;
      if (old !== rating) {
        tx.update(productRef, {
          [`rating.${rating}`]: FieldValue.increment(1),
          ...(old ? { [`rating.${old}`]: FieldValue.increment(-1) } : {}),
        });
      }
    }
    tx.set(
      reviewRef,
      {
        store_id: order.get("store_id"),
        product_id: order.get("product_id"),
        customer_uid: order.get("customer_uid"),
        name: reviewerName(buyerName),
        rating,
        text,
        hidden,
        updated_at: FieldValue.serverTimestamp(),
        ...(prev.exists ? {} : { created_at: FieldValue.serverTimestamp() }),
      },
      { merge: true }
    );
  });
}
