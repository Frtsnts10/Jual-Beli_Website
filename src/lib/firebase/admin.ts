import "server-only";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Not a secret; pinned so a stale FIREBASE_PROJECT_ID env var can't point the
// Admin SDK at another project.
const FIREBASE_PROJECT_ID = "web-store-4cf23";

// Hosting dashboards often store the key with escaped newlines, wrapping quotes or a
// different line width; normalise back to a canonical 64-column PEM block.
function formatPrivateKey(key?: string) {
  if (!key) return undefined;
  const cleaned = key.replace(/\\n/g, "\n").replace(/["']/g, "");
  const header = "-----BEGIN PRIVATE KEY-----";
  const footer = "-----END PRIVATE KEY-----";
  if (!cleaned.includes(header) || !cleaned.includes(footer)) return cleaned;
  const body = cleaned.replace(header, "").replace(footer, "").replace(/\s+/g, "");
  return `${header}\n${(body.match(/.{1,64}/g) ?? []).join("\n")}\n${footer}`;
}

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
