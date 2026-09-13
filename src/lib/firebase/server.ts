import * as admin from 'firebase-admin';
import { cookies } from 'next/headers';

// Hardcoded to match the project the client SDK talks to (src/lib/firebase/client.ts) —
// not a secret, so pinning it here means a stale FIREBASE_PROJECT_ID env var can't
// point the Admin SDK at the wrong Firebase project.
const FIREBASE_PROJECT_ID = "web-store-4cf23";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
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
