import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

/** Host-only cookie: every store domain keeps its own buyer session for the same account. */
export const CUSTOMER_COOKIE = "customer_session";

export interface Customer {
  uid: string;
  email: string;
  email_verified: boolean;
  /** Signed in with Google (email is managed by Google, no password to reset). */
  google: boolean;
  name: string;
  phone: string;
  /** Last QRIS / e-wallet channel used, offered as one-tap "pay the same way" at checkout. */
  last_channel: string | null;
}

/** The signed-in buyer on this domain, or null. */
export const getCustomer = cache(async (): Promise<Customer | null> => {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(token, true);
    const snap = await adminDb.collection("customers").doc(decoded.uid).get();
    if (!snap.exists) return null;
    // The session cookie keeps the claim from sign-in time; after the buyer clicks the
    // verification link, ask Auth directly (only while still unverified).
    const verified = decoded.email_verified || (await adminAuth.getUser(decoded.uid)).emailVerified;
    return {
      uid: decoded.uid,
      email: (snap.get("email") as string) ?? decoded.email ?? "",
      email_verified: verified,
      google: decoded.firebase?.sign_in_provider === "google.com",
      name: (snap.get("name") as string) ?? "",
      phone: (snap.get("phone") as string) ?? "",
      last_channel: (snap.get("saved_checkout.last_channel") as string) ?? null,
    };
  } catch {
    return null; // expired, revoked (password change, account deleted) or malformed
  }
});

/** For account pages: the buyer, or a redirect to this store's sign-in page. */
export async function requireCustomer(signInHref: string): Promise<Customer> {
  const customer = await getCustomer();
  if (!customer) redirect(signInHref);
  return customer;
}
