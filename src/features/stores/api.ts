import { adminDb } from "@/lib/firebase/server";
import { Store } from "@/types/schema";

export async function getStore(): Promise<Store | null> {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID;
  if (!storeId) return null;

  try {
    const doc = await adminDb.collection("stores").doc(storeId).get();
    if (!doc.exists) return null;

    return { id: doc.id, ...doc.data() } as Store;
  } catch (err) {
    console.error("Error fetching store:", err);
    return null;
  }
}
