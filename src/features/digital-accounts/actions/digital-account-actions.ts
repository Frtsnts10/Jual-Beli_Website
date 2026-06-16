"use server";

import { adminDb } from "@/lib/firebase/server";

export interface DigitalAccount {
  id: string;
  store_id: string;
  provider: string;
  email: string;
  account_type: string;
  total_profiles: number;
  profiles: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export async function getDigitalAccountsAction(storeId: string): Promise<DigitalAccount[]> {
  try {
    const snap = await adminDb.collection("digital_accounts")
      .where("store_id", "==", storeId)
      .orderBy("created_at", "desc")
      .get();
      
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DigitalAccount[];
  } catch (err: any) {
    console.error(">>> [ERROR] getDigitalAccountsAction failed:", err.message);
    return [];
  }
}
