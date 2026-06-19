"use server";

import { adminDb, getAuthenticatedUser } from "@/lib/firebase/server";

export async function updateCustomerProfileAction(
  storeId: string,
  data: { name: string; phone: string }
) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Unauthenticated" };

  try {
    const custSnap = await adminDb.collection("customers")
      .where("store_id", "==", storeId)
      .where("email", "==", user.email)
      .limit(1)
      .get();

    if (custSnap.empty) {
      // If customer doesn't exist, create it
      const newCustRef = adminDb.collection("customers").doc();
      await newCustRef.set({
        id: newCustRef.id,
        store_id: storeId,
        email: user.email,
        name: data.name,
        phone: data.phone,
        purchased_products: [],
        total_orders: 0,
        created_at: new Date().toISOString(),
      });
      return { success: true };
    }

    const docId = custSnap.docs[0].id;
    await adminDb.collection("customers").doc(docId).update({
      name: data.name,
      phone: data.phone,
      updated_at: new Date().toISOString(),
    });

    return { success: true };
  } catch (err: any) {
    console.error("Update profile error:", err);
    return { error: err.message };
  }
}
