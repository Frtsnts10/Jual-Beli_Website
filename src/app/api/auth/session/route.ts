import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { CUSTOMER_COOKIE } from "@/lib/customer";
import { allow } from "@/lib/rate-limit";

const EXPIRES_IN_MS = 14 * 24 * 60 * 60 * 1000;

// Buyer sign-in on a storefront: trades a fresh Firebase ID token for an httpOnly session
// cookie scoped to this host (each store domain signs in separately, same account).
// Creates/refreshes the buyer profile in customers/{uid} — never the seller's users/{uid}.
export async function POST(req: NextRequest) {
  try {
    if (!(await allow("session"))) return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
    const { idToken, name } = (await req.json()) as { idToken?: string; name?: string };
    if (!idToken) return NextResponse.json({ error: "Missing idToken" }, { status: 400 });

    const decoded = await adminAuth.verifyIdToken(idToken);
    if (Date.now() / 1000 - decoded.auth_time > 5 * 60) {
      return NextResponse.json({ error: "Sesi login kedaluwarsa, silakan masuk ulang." }, { status: 401 });
    }

    const ref = adminDb.collection("customers").doc(decoded.uid);
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const email = (decoded.email ?? "").toLowerCase();
      if (!snap.exists) {
        tx.set(ref, {
          email,
          name: (name?.trim() || decoded.name || "").slice(0, 80),
          phone: "",
          created_at: FieldValue.serverTimestamp(),
        });
      } else if (email && snap.get("email") !== email) {
        tx.update(ref, { email }); // the buyer confirmed an email change
      }
    });

    const session = await adminAuth.createSessionCookie(idToken, { expiresIn: EXPIRES_IN_MS });
    const res = NextResponse.json({ success: true });
    res.cookies.set(CUSTOMER_COOKIE, session, {
      maxAge: EXPIRES_IN_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
    return res;
  } catch (error) {
    console.error("Customer session error:", error);
    return NextResponse.json({ error: "Gagal masuk. Coba lagi." }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(CUSTOMER_COOKIE);
  return res;
}
