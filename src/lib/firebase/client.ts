import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize auth and db only if we have an API key (prevents build errors on Vercel without env vars)
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;

if (firebaseConfig.apiKey) {
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Mock objects for build time
  auth = {} as ReturnType<typeof getAuth>;
  db = {} as ReturnType<typeof getFirestore>;
}

export { app, auth, db };
