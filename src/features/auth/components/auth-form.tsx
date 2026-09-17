"use client";

import React, { useState } from "react";
import { User, Mail, KeyRound, Loader2 } from "lucide-react";
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

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        await handleSessionCreation(idToken);
        router.push("/profile");
      } else {
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const name = `${firstName} ${lastName}`.trim();

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });

        // Send email verification
        const { sendEmailVerification } = await import("firebase/auth");
        await sendEmailVerification(userCredential.user);

        const idToken = await userCredential.user.getIdToken();
        await handleSessionCreation(idToken);
        setSuccess("Account created. Please check your email to verify your account.");
        setTimeout(() => router.push("/profile"), 2000);
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
          <div className="h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center px-4 text-rose-700 text-xs font-bold leading-tight overflow-hidden">
            <span className="truncate w-full block">{error}</span>
          </div>
        )}

        {success && (
          <div className="h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center px-4 text-emerald-700 text-xs font-bold">
            {success}
          </div>
        )}

        {!isLogin && (
          <div className="flex gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[11px] font-bold text-stone-600 uppercase tracking-widest">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  name="firstName"
                  type="text"
                  placeholder="Alexander"
                  required
                  className="w-full h-14 bg-white border border-stone-200 rounded-2xl pl-12 pr-5 text-sm text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[11px] font-bold text-stone-600 uppercase tracking-widest">Last Name</label>
              <div className="relative">
                <input
                  name="lastName"
                  type="text"
                  placeholder="Vance"
                  required
                  className="w-full h-14 bg-white border border-stone-200 rounded-2xl px-5 text-sm text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-stone-600 uppercase tracking-widest">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              name="email"
              type="email"
              placeholder="name@domain.com"
              required
              className="w-full h-14 bg-white border border-stone-200 rounded-2xl pl-12 pr-5 text-sm text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-stone-600 uppercase tracking-widest">Password</label>
          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              name="password"
              type="password"
              placeholder="••••••••••••"
              required
              className="w-full h-14 bg-white border border-stone-200 rounded-2xl pl-12 pr-5 text-sm text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-14 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            isLogin ? "Sign In" : "Create Account"
          )}
        </button>
      </form>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-stone-200"></div>
        <span className="flex-shrink-0 mx-4 text-stone-400 text-[11px] font-bold uppercase tracking-widest">Or</span>
        <div className="flex-grow border-t border-stone-200"></div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isPending}
        className="w-full h-14 rounded-2xl bg-white text-stone-900 font-bold text-sm hover:bg-stone-50 border border-stone-200 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <FcGoogle className="w-5 h-5" />
        Continue with Google
      </button>
    </div>
  );
}
