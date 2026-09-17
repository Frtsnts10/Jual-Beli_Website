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
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-6">
        <div className="bg-white border border-stone-200 shadow-xl rounded-[32px] max-w-md w-full p-12 text-center">
          <ShieldAlert className="w-14 h-14 text-blue-600 mx-auto mb-8" />
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight mb-3">Sign in required</h2>
          <p className="text-sm text-stone-500 mb-10 leading-relaxed">You need to sign in to view your orders and account.</p>
          <Link href="/login">
            <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors text-sm">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const { customer, purchased_products = [], total_orders = 0, orders = [] } = result as any;

  return (
    <ProfilePageClient 
      customer={customer}
      storeId={storeId}
      purchased_products={purchased_products} 
      total_orders={total_orders} 
      orders={orders}
      customerSignOutAction={customerSignOutAction} 
    />
  );
}
