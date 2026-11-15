"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { getStore } from "@/lib/stores";
import { ORDER_ID_RE } from "@/lib/order-id";
import { allow } from "@/lib/rate-limit";

export type ProofState = { ok?: boolean; error?: string } | undefined;

/** ~700 KB of base64; the browser compresses screenshots to well under this. */
const MAX_DATA_URL = 950_000;
const DATA_URL_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;

/**
 * Stores the buyer's payment screenshot for the seller to check. The order id in the URL is
 * the buyer's capability (it's random and only shown to them); proofs can be replaced until
 * the seller decides, but not after the order is paid, failed or past its pay-by time.
 */
export async function uploadPaymentProof(storeKey: string, orderId: string, image: string): Promise<ProofState> {
  if (!ORDER_ID_RE.test(orderId)) return { error: "Pesanan tidak ditemukan." };
  if (image.length > MAX_DATA_URL || !DATA_URL_RE.test(image)) return { error: "Gambar tidak valid atau terlalu besar. Unggah screenshot JPG/PNG." };
  if (!(await allow("proof"))) return { error: "Terlalu banyak unggahan. Coba lagi beberapa menit lagi." };

  const store = await getStore(storeKey);
  const orderRef = adminDb.collection("orders").doc(orderId);
  const error = await adminDb.runTransaction(async (tx) => {
    const order = await tx.get(orderRef);
    if (!store || !order.exists || order.get("store_id") !== store.id) return "Pesanan tidak ditemukan.";
    if (order.get("payment_status") === "PAID") return "Pesanan ini sudah lunas.";
    if (order.get("payment_status") !== "PENDING") return "Pesanan ini sudah dibatalkan. Silakan pesan ulang.";
    const payBy = order.get("pay_by")?.toMillis?.() ?? 0;
    if (!order.get("proof_uploaded_at") && payBy && payBy < Date.now()) return "Batas waktu pembayaran sudah lewat. Silakan pesan ulang.";
    tx.set(adminDb.collection("payment_proofs").doc(orderId), { store_id: store.id, image, uploaded_at: FieldValue.serverTimestamp() });
    tx.update(orderRef, { proof_uploaded_at: FieldValue.serverTimestamp() });
    return null;
  });
  if (error) return { error };
  revalidatePath("/", "layout");
  return { ok: true };
}
