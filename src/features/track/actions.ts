"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { getStore } from "@/lib/stores";
import { ORDER_ID_RE } from "@/lib/order-id";

export interface TrackedOrder {
  id: string;
  product_title: string;
  amount: number;
  payment_status: string;
  delivery_status: string;
  warranty_status: string;
  created_at: string;
  paid_at: string | null;
  access_expires_at: string | null;
}

export type TrackState = { error?: string; order?: TrackedOrder; orderId?: string; email?: string; claimed?: boolean } | undefined;

const iso = (v: unknown) => (v && typeof v === "object" && "toDate" in v ? (v as { toDate(): Date }).toDate().toISOString() : null);

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

function toTracked(snap: FirebaseFirestore.DocumentSnapshot): TrackedOrder {
  return {
    id: snap.id,
    product_title: snap.get("product_title"),
    amount: snap.get("amount"),
    payment_status: snap.get("payment_status"),
    delivery_status: snap.get("delivery_status"),
    warranty_status: snap.get("warranty_status"),
    created_at: iso(snap.get("created_at")) ?? "",
    paid_at: iso(snap.get("paid_at")),
    access_expires_at: iso(snap.get("access_expires_at")),
  };
}

export async function trackOrder(storeKey: string, _prev: TrackState, form: FormData): Promise<TrackState> {
  const orderId = String(form.get("order_id") ?? "");
  const email = String(form.get("email") ?? "");
  const snap = await findOrder(storeKey, orderId, email);
  if (!snap) return { orderId, email, error: "Pesanan tidak ditemukan. Periksa ID invoice dan email Anda." };
  return { orderId: snap.id, email, order: toTracked(snap) };
}

export async function claimWarranty(storeKey: string, _prev: TrackState, form: FormData): Promise<TrackState> {
  const orderId = String(form.get("order_id") ?? "");
  const email = String(form.get("email") ?? "");
  const reason = String(form.get("reason") ?? "").trim();

  const snap = await findOrder(storeKey, orderId, email);
  if (!snap) return { orderId, email, error: "Pesanan tidak ditemukan." };
  const order = toTracked(snap);
  const back = { orderId: snap.id, email, order };

  if (reason.length < 10) return { ...back, error: "Jelaskan masalahnya (minimal 10 karakter)." };
  if (order.payment_status !== "PAID") return { ...back, error: "Pesanan belum lunas." };
  if (order.warranty_status === "CLAIMED") return { ...back, error: "Klaim Anda sedang diproses penjual." };
  if (order.access_expires_at && new Date(order.access_expires_at) < new Date()) {
    return { ...back, error: "Masa aktif akun sudah habis, garansi tidak berlaku." };
  }

  await snap.ref.update({
    warranty_status: "CLAIMED",
    warranty_claim: { reason: reason.slice(0, 500), claimed_at: FieldValue.serverTimestamp() },
  });
  return { ...back, order: { ...order, warranty_status: "CLAIMED" }, claimed: true };
}
