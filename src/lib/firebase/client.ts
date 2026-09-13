import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Public client config — safe to embed directly (access is enforced by
// Firestore Security Rules, not by keeping these values secret).
const firebaseConfig = {
  apiKey: "AIzaSyAFDaggQZQNTG850wYancu2H9WB0VYQ0fY",
  authDomain: "web-store-4cf23.firebaseapp.com",
  projectId: "web-store-4cf23",
  storageBucket: "web-store-4cf23.firebasestorage.app",
  messagingSenderId: "551756253728",
  appId: "1:551756253728:web:6a2c65d0819e1158da0a45"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
