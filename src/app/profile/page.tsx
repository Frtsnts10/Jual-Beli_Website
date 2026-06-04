import React from "react";
import { getCustomerOrdersAction } from "@/features/orders/actions/order-actions";
import { customerSignOutAction } from "@/features/auth/actions/customer-auth-actions";
import { ProfilePageClient } from "@/features/profile/components/profile-page-client";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!; 
  const result = await getCustomerOrdersAction(storeId);

  if (result.error === "Unauthenticated") {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900/5 rounded-full blur-[140px] w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[48px] max-w-md w-full p-16 text-center relative z-10">
          <ShieldAlert className="w-20 h-20 text-rose-500/30 mx-auto mb-10" />
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-6">Access Restricted</h2>
          <p className="text-sm text-slate-500 mb-12 leading-relaxed font-medium uppercase tracking-widest">You must authenticate your identity protocol to access your secure inventory vault.</p>
          <Link href="/login">
            <button className="w-full py-5 bg-white text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] shadow-2xl shadow-white/5">
              Sign In to Vault
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const { purchased_products = [], total_orders = 0, orders = [] } = result;

  return (
    <ProfilePageClient 
      purchased_products={purchased_products} 
      total_orders={total_orders} 
      orders={orders}
      customerSignOutAction={customerSignOutAction} 
    />
  );
}
