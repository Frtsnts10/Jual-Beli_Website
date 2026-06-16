"use client";

import React, { useState } from "react";
import { User, Mail, KeyRound, Fingerprint, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { auth } from "@/lib/firebase/client";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  isLogin: boolean;
}

export function AuthForm({ isLogin }: AuthFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSessionCreation = async (idToken: string) => {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create session");
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        await handleSessionCreation(idToken);
        router.push("/profile");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        const idToken = await userCredential.user.getIdToken();
        await handleSessionCreation(idToken);
        setSuccess("Identity initialized. Securing connection...");
        setTimeout(() => router.push("/profile"), 1000);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsPending(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();
      await handleSessionCreation(idToken);
      router.push("/profile");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center px-4 text-rose-400 text-[10px] font-bold uppercase tracking-widest leading-tight overflow-hidden">
            <span className="truncate w-full block">{error}</span>
          </div>
        )}

        {success && (
          <div className="h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center px-4 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
            {success}
          </div>
        )}

        {!isLogin && (
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Identity Designation</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                name="name"
                type="text"
                placeholder="Alexander Vance"
                required
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 text-sm text-white font-medium placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              name="email"
              type="email"
              placeholder="name@domain.com"
              required
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 text-sm text-white font-medium placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Password</label>
          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              name="password"
              type="password"
              placeholder="••••••••••••"
              required
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 text-sm text-white font-medium placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Fingerprint className="w-5 h-5" />
              {isLogin ? "Confirm Session" : "Deploy Credentials"}
            </>
          )}
        </button>
      </form>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-white/5"></div>
        <span className="flex-shrink-0 mx-4 text-zinc-600 text-[10px] font-black uppercase tracking-widest">Or Access Via</span>
        <div className="flex-grow border-t border-white/5"></div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isPending}
        className="w-full h-14 rounded-2xl bg-white/5 text-white font-black uppercase tracking-widest text-[11px] hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <FcGoogle className="w-5 h-5" />
        Google Auth
      </button>
    </div>
  );
}
