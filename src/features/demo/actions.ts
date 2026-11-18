"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { getStore } from "@/lib/stores";
import { ORDER_ID_RE } from "@/lib/order-id";
import { allow } from "@/lib/rate-limit";
import { groupIdOf, groupOrders } from "@/lib/order-group";
import { DEMO_STORE_ID, fulfillDemoOrder } from "@/lib/demo-pay";

/** "Simulasikan pembayaran" on the demo store: the whole checkout becomes paid, accounts allocated. */
export async function simulateDemoPayment(storeKey: string, orderId: string): Promise<{ error?: string }> {
  if (!ORDER_ID_RE.test(orderId)) return { error: "Pesanan tidak ditemukan." };
  const store = await getStore(storeKey);
  if (!store || store.id !== DEMO_STORE_ID) return { error: "Hanya tersedia di toko demo." };
  if (!(await allow("proof"))) return { error: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." };
  const lead = await adminDb.collection("orders").doc(orderId).get();
  if (!lead.exists || lead.get("store_id") !== store.id || groupIdOf(lead) !== orderId) return { error: "Pesanan tidak ditemukan." };
  if (lead.get("payment_status") !== "PENDING") return { error: "Pesanan ini sudah tidak menunggu pembayaran." };
  for (const m of await groupOrders(lead)) await fulfillDemoOrder(m.id);
  revalidatePath("/", "layout");
  return {};
}
