"use server";

import { adminDb } from "@/lib/firebase/server";

export interface Review {
  id: string;
  name: string;
  handle?: string;
  rating: number;
  badge?: string;
  product?: string;
  comment: string;
  avatarBg?: string;
  initials?: string;
  date?: string;
  store_id: string;
  created_at?: string;
}

export async function getReviewsAction(storeId: string): Promise<Review[]> {
  try {
    const snap = await adminDb.collection("reviews")
      .where("store_id", "==", storeId)
      .get();

    const reviews = snap.docs.map((doc: any) => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d.name || "Anonymous",
        handle: d.handle || `@${(d.name || "anon").toLowerCase().replace(/\s+/g, "")}.node`,
        rating: d.rating || 5,
        badge: d.badge || "Verified Operator",
        product: d.product || "Digital Asset",
        comment: d.comment || "",
        avatarBg: d.avatarBg || "from-indigo-500 to-blue-600",
        initials: (d.name || "Anonymous").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
        date: d.date || "Recently",
        store_id: d.store_id,
        created_at: d.created_at || new Date().toISOString()
      } as Review;
    });

    // Sort by created_at descending or just return directly
    return reviews.sort((a: any, b: any) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
  } catch (err: any) {
    console.error("Error fetching reviews:", err);
    return [];
  }
}
