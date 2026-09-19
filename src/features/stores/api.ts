import { adminDb } from "@/lib/firebase/server";
import { getActiveStoreId } from "@/lib/get-store-id";
import { Store } from "@/types/schema";

export async function getStore(): Promise<Store | null> {
  const storeId = await getActiveStoreId();
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
