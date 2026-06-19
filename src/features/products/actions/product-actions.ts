"use server";

import { adminDb } from "@/lib/firebase/server";

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  selling_price: number;
  stock: number;
  category: string | null;
  group_name?: string | null;
  profile_tier?: string | null;
  created_at: string;
}

export async function getProductsAction(storeId: string): Promise<Product[]> {
  try {
    const snap = await adminDb.collection("inventory")
      .where("store_id", "==", storeId)
      .get();

    const products = snap.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d.name,
        selling_price: d.selling_price,
        stock: d.stock,
        category: d.category || null,
        group_name: d.group_name || null,
        profile_tier: d.profile_tier || null,
        created_at: d.created_at,
      } as Product;
    });

    return products.sort((a, b) => b.stock - a.stock);
  } catch (err: any) {
    console.error("Error fetching products:", err);
    return [];
  }
}

export async function getProductAction(productId: string): Promise<Product | null> {
  try {
    const doc = await adminDb.collection("inventory").doc(productId).get();

    if (!doc.exists) {
      console.error("Error fetching product: not found");
      return null;
    }

    const d = doc.data()!;
    return {
      id: doc.id,
      name: d.name,
      selling_price: d.selling_price,
      stock: d.stock,
      category: d.category || null,
      group_name: d.group_name || null,
      profile_tier: d.profile_tier || null,
      created_at: d.created_at,
    } as Product;
  } catch (err: any) {
    console.error("Error fetching product:", err);
    return null;
  }
}
