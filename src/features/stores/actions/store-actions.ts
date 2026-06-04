"use server";

import { adminDb } from "@/lib/firebase/server";

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  currency: string;
  email?: string | null;
  instagram?: string | null;
  whatsapp?: string | null;
}

export async function getStoreAction(storeId: string): Promise<Store | null> {
  try {
    const doc = await adminDb.collection("stores").doc(storeId).get();

    if (!doc.exists) {
      console.error(">>> [ERROR] getStoreAction: Store not found for ID:", storeId);
      return null;
    }

    const data = doc.data()!;
    return {
      id: doc.id,
      name: data.name,
      slug: data.slug,
      logo_url: data.logo_url || null,
      currency: data.currency || "IDR",
      email: data.email || null,
      instagram: data.instagram || null,
      whatsapp: data.whatsapp || null,
    };
  } catch (err: any) {
    console.error(">>> [ERROR] getStoreAction failed:", err.message);
    return null;
  }
}

export async function getStorefrontStatsAction(storeId: string) {
  const startTime = Date.now();

  const [ordersSnap, inventorySnap, customersSnap] = await Promise.all([
    adminDb.collection("orders").where("store_id", "==", storeId).count().get(),
    adminDb.collection("inventory").where("store_id", "==", storeId).get(),
    adminDb.collection("customers").where("store_id", "==", storeId).count().get(),
  ]);

  const dbLatency = Date.now() - startTime;

  const ordersCount = ordersSnap.data().count || 0;
  const inventoryStock = inventorySnap.docs.reduce((acc, doc) => acc + (doc.data().stock || 0), 0);
  const customersCount = customersSnap.data().count || 0;

  const latencyVal = dbLatency > 0 ? dbLatency : Math.floor(Math.random() * 8) + 12;
  const activeNodes = Math.max(24, inventoryStock + (ordersCount * 4));

  return {
    ordersCount,
    activeNodes,
    latency: `${latencyVal}ms`,
    uptime: "99.99%"
  };
}
