import { cache } from "react";
import { adminDb } from "@/lib/firebase/server";

// This storefront is single-tenant — exactly one document in `stores` backs
// this deployment, so there's nothing to configure. `cache()` dedupes this
// Firestore read across every call within one request/render pass.
export const getActiveStoreId = cache(async (): Promise<string | null> => {
  try {
    const snap = await adminDb.collection("stores").limit(1).get();
    if (snap.empty) return null;
    return snap.docs[0].id;
  } catch (err) {
    console.error("Error resolving active store:", err);
    return null;
  }
});
