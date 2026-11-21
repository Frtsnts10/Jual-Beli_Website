"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { getPublishedProduct, getStore } from "@/lib/stores";
import { DEMO_MESSAGE, getCustomer } from "@/lib/customer";
import { normalisePhone } from "@/lib/phone";
import { allow } from "@/lib/rate-limit";

export type RestockState = { ok?: boolean; error?: string; phone?: string } | undefined;

/**
 * "Kabari saya": remembers that this WhatsApp number wants a message when the product is back.
 * One request per number per product (asking again re-arms an alert that was already sent).
 * The dashboard sends the messages when the seller adds stock.
 */
export async function requestRestock(storeKey: string, productId: string, _prev: RestockState, form: FormData): Promise<RestockState> {
  const phoneRaw = String(form.get("phone") ?? "").trim();
  const phone = normalisePhone(phoneRaw);
  if (!phone) return { phone: phoneRaw, error: "Nomor WhatsApp tidak valid (contoh: 0812xxxxxxx)." };
  if (!(await allow("restock"))) return { phone: phoneRaw, error: "Terlalu banyak permintaan. Coba lagi nanti." };

  const store = await getStore(storeKey);
  const product = store && (await getPublishedProduct(store.id, productId));
  if (!store || !product) return { error: "Produk tidak ditemukan." };
  if (product.stock_available > 0 && store.is_active) return { error: "Produk ini sudah tersedia — silakan langsung beli." };

  const customer = await getCustomer();
  if (customer?.demo) return { error: DEMO_MESSAGE };
  const ref = adminDb.collection("restock_requests").doc(`${store.id}_${product.id}_${phone.replace(/\D/g, "")}`);
  const existing = await ref.get();
  await ref.set(
    {
      store_id: store.id,
      product_id: product.id,
      phone,
      email: customer?.email ?? null,
      customer_uid: customer?.uid ?? null,
      notified_at: null,
      ...(existing.exists ? { updated_at: FieldValue.serverTimestamp() } : { created_at: FieldValue.serverTimestamp() }),
    },
    { merge: true }
  );
  return { ok: true, phone: phoneRaw };
}
