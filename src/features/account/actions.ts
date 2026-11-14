"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { CUSTOMER_COOKIE, getCustomer } from "@/lib/customer";
import { getStore } from "@/lib/stores";
import { fileClaim } from "@/lib/orders";
import { normalisePhone } from "@/lib/phone";
import { allow } from "@/lib/rate-limit";

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

/**
 * Deletes the buyer's login and profile. Orders stay (the seller needs them for records and
 * warranty) but are unlinked from the account. Accounts that are also a seller's dashboard
 * login are refused here — deleting the shared login would lock the seller out.
 */
export async function deleteAccount(homeHref: string, _prev: FormState, form: FormData): Promise<FormState> {
  const customer = await getCustomer();
  if (!customer) return SIGNED_OUT;
  if (String(form.get("confirm") ?? "").trim().toUpperCase() !== "HAPUS") return { error: 'Ketik "HAPUS" untuk mengonfirmasi.' };
  if (!(await allow("account"))) return { error: "Terlalu banyak percobaan. Coba lagi nanti." };
  if ((await adminDb.collection("users").doc(customer.uid).get()).exists) {
    return { error: "Email ini juga dipakai untuk akun penjual di dashboard. Hubungi admin platform untuk menghapusnya." };
  }

  const orders = await adminDb.collection("orders").where("customer_uid", "==", customer.uid).get();
  for (let i = 0; i < orders.docs.length; i += 400) {
    const batch = adminDb.batch();
    orders.docs.slice(i, i + 400).forEach((d) => batch.update(d.ref, { customer_uid: FieldValue.delete() }));
    await batch.commit();
  }
  await adminDb.collection("customers").doc(customer.uid).delete();
  await adminAuth.deleteUser(customer.uid).catch((err) => {
    if ((err as { code?: string }).code !== "auth/user-not-found") throw err;
  });
  (await cookies()).delete(CUSTOMER_COOKIE);
  // Straight to the store (the account pages would bounce a signed-out visitor to /masuk).
  redirect(homeHref.startsWith("/") && !homeHref.startsWith("//") ? homeHref : "/");
}
