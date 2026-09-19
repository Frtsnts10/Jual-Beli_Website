import * as admin from 'firebase-admin';
import { cookies } from 'next/headers';

// Hardcoded to match the project the client SDK talks to (src/lib/firebase/client.ts) —
// not a secret, so pinning it here means a stale FIREBASE_PROJECT_ID env var can't
// point the Admin SDK at the wrong Firebase project.
const FIREBASE_PROJECT_ID = "web-store-4cf23";

// Hosting dashboards commonly store the key with its newlines escaped, wrapped in
// quotes, or re-wrapped at a different width. Any of those reach the OpenSSL decoder
// as a malformed PEM, so normalise back to a canonical 64-column block first.
function formatPrivateKey(key?: string) {
  if (!key) return undefined;

  const cleaned = key.replace(/\\n/g, '\n').replace(/"/g, '').replace(/'/g, '');

  const header = '-----BEGIN PRIVATE KEY-----';
  const footer = '-----END PRIVATE KEY-----';

  if (cleaned.includes(header) && cleaned.includes(footer)) {
    const body = cleaned.replace(header, '').replace(footer, '').replace(/\s+/g, '');
    const chunks = body.match(/.{1,64}/g) || [];
    return `${header}\n${chunks.join('\n')}\n${footer}`;
  }

  return cleaned;
}

if (!admin.apps.length) {
  // Deliberately not wrapped in try/catch: a swallowed failure here leaves no default
  // app, and the admin.firestore() call below then throws "The default Firebase app
  // does not exist" — which hides the real cause (bad credentials) behind a misleading
  // message on every page.
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

/**
 * Verifies the session cookie and returns the decoded user or null.
 */
export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return null;

    const decoded = await adminAuth.verifySessionCookie(session, true);
    return decoded;
  } catch {
    return null;
  }
}
