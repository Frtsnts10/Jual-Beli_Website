import "server-only";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { formatPrivateKey } from "./private-key";

// Not a secret; pinned so a stale FIREBASE_PROJECT_ID env var can't point the
// Admin SDK at another project.
const FIREBASE_PROJECT_ID = "web-store-dashboard";

function getAdminApp() {
  if (getApps().length > 0) return getApp();
  // Local development against the Firestore/Auth emulators needs no credentials.
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return initializeApp({ projectId: FIREBASE_PROJECT_ID });
  }
  return initializeApp({
    credential: cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
  });
}

// Initialised on first use, so `next build` never needs credentials.
function lazy<T extends object>(resolve: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop) {
      const instance = resolve();
      const value = Reflect.get(instance, prop, instance);
      return typeof value === "function" ? value.bind(instance) : value;
    },
  });
}

export const adminDb = lazy(() => getFirestore(getAdminApp()));
export const adminAuth = lazy(() => getAuth(getAdminApp()));
export const adminMessaging = lazy(() => getMessaging(getAdminApp()));
