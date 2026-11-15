"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type UserCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { btnOutline, btnPrimary, field } from "@/lib/ui";

export const inputCls = field;
const primaryBtn = `${btnPrimary} w-full`;

const ERRORS: Record<string, string> = {
  "auth/invalid-credential": "Email atau password salah.",
  "auth/wrong-password": "Password salah.",
  "auth/user-not-found": "Akun dengan email ini belum terdaftar.",
  "auth/email-already-in-use": "Email sudah terdaftar. Silakan masuk.",
  "auth/weak-password": "Password minimal 6 karakter.",
  "auth/invalid-email": "Format email tidak valid.",
  "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.",
  "auth/popup-closed-by-user": "Login Google dibatalkan.",
  "auth/popup-blocked": "Pop-up diblokir browser. Izinkan pop-up lalu coba lagi.",
  "auth/unauthorized-domain": "Login Google belum diaktifkan untuk domain toko ini. Gunakan email & password.",
  "auth/requires-recent-login": "Demi keamanan, masukkan password Anda lagi.",
  "auth/network-request-failed": "Koneksi terputus. Periksa internet Anda.",
};

export function authError(err: unknown) {
  const code = (err as { code?: string })?.code;
  if (code && ERRORS[code]) return ERRORS[code];
  return err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.";
}

/** Only same-site relative paths are allowed as the post-login destination. */
const safeNext = (next: string, fallback: string) => (next.startsWith("/") && !next.startsWith("//") ? next : fallback);

/** Trades the fresh Firebase sign-in for this store domain's httpOnly session cookie. */
async function startSession(cred: UserCredential, next: string, name?: string) {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: await cred.user.getIdToken(), name }),
  });
  if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error ?? "Gagal masuk.");
  window.location.assign(next);
}

function GoogleButton({ next, onError }: { next: string; onError: (msg: string) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await startSession(await signInWithPopup(auth, new GoogleAuthProvider()), next);
        } catch (err) {
          onError(authError(err));
          setBusy(false);
        }
      }}
      className={`${btnOutline} w-full font-medium`}
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />} Lanjut dengan Google
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 text-xs text-neutral-400">
      <span className="h-px flex-1 bg-neutral-200" /> atau <span className="h-px flex-1 bg-neutral-200" />
    </div>
  );
}

export function SignInForm({ next, accountHref, signUpHref, forgotHref }: { next: string; accountHref: string; signUpHref: string; forgotHref: string }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const dest = safeNext(next, accountHref);
  return (
    <div className="grid gap-4">
      <form
        className="grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setBusy(true);
          setError(null);
          try {
            await startSession(await signInWithEmailAndPassword(auth, String(f.get("email")).trim(), String(f.get("password"))), dest);
          } catch (err) {
            setError(authError(err));
            setBusy(false);
          }
        }}
      >
        <input name="email" type="email" required autoComplete="email" placeholder="Email" className={inputCls} />
        <input name="password" type="password" required autoComplete="current-password" placeholder="Password" className={inputCls} />
        <Link href={forgotHref} className="justify-self-end text-xs text-neutral-500 hover:text-neutral-900">
          Lupa password?
        </Link>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button disabled={busy} className={primaryBtn}>
          {busy && <Loader2 className="size-4 animate-spin" />} Masuk
        </button>
      </form>
      <Divider />
      <GoogleButton next={dest} onError={setError} />
      <p className="text-center text-sm text-neutral-500">
        Belum punya akun?{" "}
        <Link href={signUpHref} className="font-medium text-neutral-900 underline underline-offset-4">
          Daftar
        </Link>
      </p>
    </div>
  );
}

export function SignUpForm({ next, accountHref, signInHref, email }: { next: string; accountHref: string; signInHref: string; email?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const dest = safeNext(next, accountHref);
  return (
    <div className="grid gap-4">
      <form
        className="grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const name = String(f.get("name")).trim();
          setBusy(true);
          setError(null);
          try {
            const cred = await createUserWithEmailAndPassword(auth, String(f.get("email")).trim(), String(f.get("password")));
            await updateProfile(cred.user, { displayName: name });
            // Past guest orders are linked once this address is verified.
            await sendEmailVerification(cred.user).catch(() => {});
            await startSession(cred, dest, name);
          } catch (err) {
            setError(authError(err));
            setBusy(false);
          }
        }}
      >
        <input name="name" required minLength={2} autoComplete="name" placeholder="Nama" className={inputCls} />
        <input name="email" type="email" required autoComplete="email" placeholder="Email" defaultValue={email} className={inputCls} />
        <input name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="Password (min. 6 karakter)" className={inputCls} />
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button disabled={busy} className={primaryBtn}>
          {busy && <Loader2 className="size-4 animate-spin" />} Buat akun
        </button>
      </form>
      <Divider />
      <GoogleButton next={dest} onError={setError} />
      <p className="text-center text-sm text-neutral-500">
        Sudah punya akun?{" "}
        <Link href={signInHref} className="font-medium text-neutral-900 underline underline-offset-4">
          Masuk
        </Link>
      </p>
    </div>
  );
}

export function ForgotPasswordForm({ signInHref }: { signInHref: string }) {
  const [state, setState] = useState<{ sent?: boolean; error?: string; busy?: boolean }>({});
  if (state.sent) {
    return (
      <div className="grid gap-4 text-sm">
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">Jika email terdaftar, link untuk membuat password baru sudah kami kirim. Cek juga folder spam.</p>
        <Link href={signInHref} className="text-center font-medium underline underline-offset-4">
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }
  return (
    <form
      className="grid gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const email = String(new FormData(e.currentTarget).get("email")).trim();
        setState({ busy: true });
        try {
          await sendPasswordResetEmail(auth, email);
          setState({ sent: true });
        } catch (err) {
          // Don't reveal whether the address has an account.
          const code = (err as { code?: string }).code;
          setState(code === "auth/user-not-found" ? { sent: true } : { error: authError(err) });
        }
      }}
    >
      <input name="email" type="email" required autoComplete="email" placeholder="Email akun Anda" className={inputCls} />
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <button disabled={state.busy} className={primaryBtn}>
        {state.busy && <Loader2 className="size-4 animate-spin" />} Kirim link reset password
      </button>
      <Link href={signInHref} className="text-center text-sm text-neutral-500 hover:text-neutral-900">
        Kembali ke halaman masuk
      </Link>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
    </svg>
  );
}
