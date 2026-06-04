"use client";

import React from "react";
import { User, Mail, KeyRound, Fingerprint, Loader2 } from "lucide-react";
import { Chip } from "@heroui/react";

interface AuthFormProps {
  isLogin: boolean;
  state: any;
  isPending: boolean;
  formAction: (payload: FormData) => void;
}

export function AuthForm({ isLogin, state, isPending, formAction }: AuthFormProps) {
  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state?.error && (
        <div className="h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center px-4 text-rose-400 text-[10px] font-bold uppercase tracking-widest">
          {state.error}
        </div>
      )}

      {state?.success && state?.message && (
        <div className="h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center px-4 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
          {state.message}
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
  );
}
