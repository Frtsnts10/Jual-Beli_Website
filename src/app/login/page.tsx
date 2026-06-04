"use client";

import React, { useState } from "react";
import { Shield, Fingerprint } from "lucide-react";
import { Chip, Separator } from "@heroui/react";
import { AuthForm } from "@/features/auth/components/auth-form";
import { customerSignInAction, customerSignUpAction } from "@/features/auth/actions/customer-auth-actions";
import Link from "next/link";
import { useActionState } from "react";

export default function CustomerAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [state, formAction, isPending] = useActionState(
    isLogin ? customerSignInAction : customerSignUpAction,
    null
  );

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(99,102,241,0.08),transparent)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
            <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black text-2xl transition-all group-hover:scale-110">
              S
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[11px] font-black text-white uppercase tracking-widest">Obsidian Secure</span>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">Protocol Terminal</span>
            </div>
          </Link>
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-tight mb-2">
            {isLogin ? "Authenticate" : "Initialize"}{" "}
            <span className="bg-gradient-to-r from-white to-indigo-400 bg-clip-text text-transparent">
              Protocol.
            </span>
          </h2>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-3xl backdrop-blur-md p-8">
          {/* Tab switcher */}
          <div className="flex items-center gap-0 border-b border-white/5 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-colors ${
                isLogin ? "text-white border-b-2 border-indigo-500 -mb-px" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Access Vault
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-colors ${
                !isLogin ? "text-white border-b-2 border-indigo-500 -mb-px" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Create Identity
            </button>
          </div>

          <AuthForm
            isLogin={isLogin}
            state={state}
            isPending={isPending}
            formAction={formAction}
          />
        </div>

        <p className="text-center mt-8 flex items-center justify-center gap-2 text-[10px] text-zinc-700 font-bold uppercase tracking-widest">
          <Shield className="w-4 h-4 text-indigo-500/50" />
          End-to-End Encrypted Handshake
        </p>
      </div>
    </main>
  );
}
