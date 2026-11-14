"use server";

import { adminDb } from "@/lib/firebase/admin";
import { getStore } from "@/lib/stores";
import { ORDER_ID_RE } from "@/lib/order-id";
import { allow } from "@/lib/rate-limit";
import { fileClaim, toTracked, type TrackedOrder } from "@/lib/orders";

export type TrackState = { error?: string; order?: TrackedOrder; orderId?: string; email?: string; claimed?: boolean } | undefined;

/** Looks an order up by ID *and* email, so knowing an order ID alone reveals nothing. */
async function findOrder(storeKey: string, orderIdRaw: string, emailRaw: string) {
  const orderId = orderIdRaw.trim().toUpperCase();
  const email = emailRaw.trim().toLowerCase();
  if (!ORDER_ID_RE.test(orderId) || !email) return null;

  const store = await getStore(storeKey);
  if (!store) return null;
  const snap = await adminDb.collection("orders").doc(orderId).get();
  if (!snap.exists || snap.get("store_id") !== store.id) return null;
  if ((snap.get("customer_contact.email") ?? "").toLowerCase() !== email) return null;
  return snap;
}

export async function trackOrder(storeKey: string, _prev: TrackState, form: FormData): Promise<TrackState> {
  const orderId = String(form.get("order_id") ?? "");
  const email = String(form.get("email") ?? "");
  // Limits guessing invoice IDs / emails.
  if (!(await allow("track"))) return { orderId, email, error: "Terlalu banyak percobaan. Coba lagi dalam beberapa menit." };
  const snap = await findOrder(storeKey, orderId, email);
  if (!snap) return { orderId, email, error: "Pesanan tidak ditemukan. Periksa ID invoice dan email Anda." };
  return { orderId: snap.id, email, order: toTracked(snap) };
}

export async function claimWarranty(storeKey: string, _prev: TrackState, form: FormData): Promise<TrackState> {
  const orderId = String(form.get("order_id") ?? "");
  const email = String(form.get("email") ?? "");
  const reason = String(form.get("reason") ?? "").trim();
  if (!(await allow("claim"))) return { orderId, email, error: "Terlalu banyak klaim. Coba lagi nanti." };

  const snap = await findOrder(storeKey, orderId, email);
  if (!snap) return { orderId, email, error: "Pesanan tidak ditemukan." };
  const order = toTracked(snap);
  const back = { orderId: snap.id, email, order };

  const error = await fileClaim(snap, reason);
  if (error) return { ...back, error };
  return { ...back, order: { ...order, warranty_status: "CLAIMED" }, claimed: true };
}
