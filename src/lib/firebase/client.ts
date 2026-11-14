import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";

// Public client config of the "web-store-dashboard" project (same as the dashboard) — safe
// to embed. Buyers and sellers share one Firebase Auth pool; buyer profiles live in
// `customers/{uid}`, seller profiles in `users/{uid}`. The client SDK is only used for
// sign-in; everything else goes through server actions with the Admin SDK.
const firebaseConfig = {
  apiKey: "AIzaSyDYlTzu5G2qS7OzBmZSIqybLW30cOwpfJ8",
  authDomain: "web-store-dashboard.firebaseapp.com",
  projectId: "web-store-dashboard",
  storageBucket: "web-store-dashboard.firebasestorage.app",
  messagingSenderId: "658565631786",
  appId: "1:658565631786:web:24e3113ac2f177cc875853",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
auth.languageCode = "id";

// Local testing against the Auth emulator.
const emulator = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
if (emulator && !(auth as unknown as { emulatorConfig?: unknown }).emulatorConfig) {
  connectAuthEmulator(auth, `http://${emulator}`, { disableWarnings: true });
}
