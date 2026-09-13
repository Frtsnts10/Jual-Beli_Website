"use client";

import React, { useState } from "react";
import { AuthForm } from "@/features/auth/components/auth-form";
import Link from "next/link";

export default function CustomerAuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <main className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-6">
      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-stone-900">Toko<span className="text-blue-600">.</span></span>
          </Link>
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-stone-500 text-sm mt-2">
            {isLogin ? "Sign in to view your orders and account." : "Sign up to start shopping and track your orders."}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-stone-200 rounded-3xl shadow-xl p-8">
          {/* Tab switcher */}
          <div className="flex items-center gap-0 border-b border-stone-200 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                isLogin ? "text-stone-900 border-b-2 border-blue-600 -mb-px" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                !isLogin ? "text-stone-900 border-b-2 border-blue-600 -mb-px" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              Create Account
            </button>
          </div>

          <AuthForm isLogin={isLogin} />
        </div>
      </div>
    </main>
  );
}
