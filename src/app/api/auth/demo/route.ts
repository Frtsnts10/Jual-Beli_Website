import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { getStore } from "@/lib/stores";
import { DEMO_STORE_ID } from "@/lib/demo-pay";
import { allow } from "@/lib/rate-limit";

/** The showcase buyer (dashboard scripts/seed-demo.mjs). Only a login with the demo claim is handed out. */
const DEMO_EMAIL = process.env.DEMO_BUYER_EMAIL || "pembeli.demo@belidi.biz.id";

/**
 * "Masuk sebagai pembeli demo" on the demo store's sign-in page: a custom token for the read-only
 * demo buyer; the browser signs in with it and gets this domain's session cookie as usual.
 */
export async function POST(req: NextRequest) {
  const { store: storeKey } = (await req.json().catch(() => ({}))) as { store?: string };
  const store = storeKey ? await getStore(storeKey) : null;
  if (store?.id !== DEMO_STORE_ID) return NextResponse.json({ error: "Hanya tersedia di toko demo." }, { status: 404 });
  if (!(await allow("session"))) return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  const user = await adminAuth.getUserByEmail(DEMO_EMAIL).catch(() => null);
  if (!user || user.customClaims?.demo !== true) return NextResponse.json({ error: "Akun pembeli demo belum disiapkan." }, { status: 404 });
  return NextResponse.json({ token: await adminAuth.createCustomToken(user.uid) });
}
