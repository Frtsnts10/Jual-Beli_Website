"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { getCustomer } from "@/lib/customer";
import { getStore } from "@/lib/stores";
import { fileClaim } from "@/lib/orders";
import { normalisePhone } from "@/lib/phone";
import { allow } from "@/lib/rate-limit";
import { writeReview } from "@/lib/reviews";

export type FormState = { ok?: boolean; error?: string } | undefined;

const SIGNED_OUT: FormState = { error: "Sesi Anda berakhir. Silakan masuk lagi." };

export async function updateProfile(_prev: FormState, form: FormData): Promise<FormState> {
  const customer = await getCustomer();
  if (!customer) return SIGNED_OUT;
  const name = String(form.get("name") ?? "").trim().slice(0, 80);
  const phoneRaw = String(form.get("phone") ?? "").trim();
  if (name.length < 2) return { error: "Nama minimal 2 karakter." };
  const phone = phoneRaw ? normalisePhone(phoneRaw) : "";
  if (phone === null) return { error: "Nomor WhatsApp tidak valid (contoh: 0812xxxxxxx)." };
  await adminDb.collection("customers").doc(customer.uid).update({ name, phone });
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Warranty claim from the account page: ownership is the signed-in account, not ID + email. */
export async function claimFromAccount(storeKey: string, _prev: FormState, form: FormData): Promise<FormState> {
  const customer = await getCustomer();
  if (!customer) return SIGNED_OUT;
  if (!(await allow("claim"))) return { error: "Terlalu banyak klaim. Coba lagi nanti." };
  const store = await getStore(storeKey);
  const snap = await adminDb.collection("orders").doc(String(form.get("order_id") ?? "")).get();
  if (!store || !snap.exists || snap.get("store_id") !== store.id || snap.get("customer_uid") !== customer.uid) {
    return { error: "Pesanan tidak ditemukan." };
  }
  const error = await fileClaim(snap, String(form.get("reason") ?? ""));
  if (error) return { error };
  // No revalidate here: re-rendering would unmount this order's form (it's no longer
  // claimable) before the buyer sees the confirmation. The status shows on the next visit.
  return { ok: true };
}

/** One review per PAID order, by the signed-in buyer who owns it; resubmitting edits it. */
export async function submitReview(storeKey: string, _prev: FormState, form: FormData): Promise<FormState> {
  const customer = await getCustomer();
  if (!customer) return SIGNED_OUT;
  if (!(await allow("review"))) return { error: "Terlalu banyak percobaan. Coba lagi nanti." };
  const rating = Number(form.get("rating"));
  const text = String(form.get("text") ?? "").trim().slice(0, 1000);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Pilih jumlah bintang (1–5)." };
  const store = await getStore(storeKey);
  const order = await adminDb.collection("orders").doc(String(form.get("order_id") ?? "")).get();
  if (!store || !order.exists || order.get("store_id") !== store.id || order.get("customer_uid") !== customer.uid) {
    return { error: "Pesanan tidak ditemukan." };
  }
  if (order.get("payment_status") !== "PAID") return { error: "Ulasan bisa ditulis setelah pesanan lunas." };
  await writeReview(order, customer.name, rating, text);
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Asks the platform to delete this account. Nothing is deleted here: a platform admin reviews
 * the request in the dashboard (Admin Platform → Hapus akun) and approves or rejects it.
 */
export async function requestAccountDeletion(storeKey: string, _prev: FormState, form: FormData): Promise<FormState> {
  const customer = await getCustomer();
  if (!customer) return SIGNED_OUT;
  if (String(form.get("confirm") ?? "").trim().toUpperCase() !== "HAPUS") return { error: 'Ketik "HAPUS" untuk mengonfirmasi.' };
  if (!(await allow("account"))) return { error: "Terlalu banyak percobaan. Coba lagi nanti." };
  const ref = adminDb.collection("account_deletion_requests").doc(customer.uid);
  if ((await ref.get()).get("status") === "PENDING") return { ok: true };
  const store = await getStore(storeKey);
  await ref.set({
    uid: customer.uid,
    email: customer.email,
    name: customer.name,
    reason: String(form.get("reason") ?? "").trim().slice(0, 500),
    store_id: store?.id ?? null,
    status: "PENDING",
    requested_at: FieldValue.serverTimestamp(),
    reviewed_at: null,
    rejected_reason: null,
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Withdraws a pending deletion request (or clears a rejected one). */
export async function cancelAccountDeletion(): Promise<FormState> {
  const customer = await getCustomer();
  if (!customer) return SIGNED_OUT;
  await adminDb.collection("account_deletion_requests").doc(customer.uid).delete();
  revalidatePath("/", "layout");
  return { ok: true };
}
