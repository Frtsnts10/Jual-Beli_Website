"use client";

import React from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import Link from "next/link";
import { Button, Chip } from "@heroui/react";
import { IdentityCard } from "./identity-card";
import { SecurityMessage } from "./security-message";
import { AcquisitionHistory } from "./acquisition-history";
import { OrderPipelineQueue } from "./order-pipeline-queue";

interface ProfilePageClientProps {
  customer: { id: string | null; name: string; email: string; phone: string };
  storeId: string;
  purchased_products: any[];
  total_orders: number;
  orders: any[];
  customerSignOutAction: any;
}

export function ProfilePageClient({ customer, storeId, purchased_products, total_orders, orders, customerSignOutAction }: ProfilePageClientProps) {
  return (
    <main className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-20">
          <div className="flex items-center gap-6">
            <Link href="/">
              <Button
                isIconOnly
                variant="outline"
                className="border-white/10 bg-white/5 hover:bg-white/10 rounded-2xl w-12 h-12"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase">My Profile</h1>
              <Chip
                size="sm"
                variant="soft"
                className="mt-2 bg-indigo-500/10 text-indigo-400 border-none text-[10px] font-bold uppercase tracking-widest"
              >
                Status: Verified Customer
              </Chip>
            </div>
          </div>

          <form action={customerSignOutAction}>
            <button
              type="submit"
              className="flex items-center gap-2 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 h-12 px-6 rounded-2xl transition-all cursor-pointer bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>

        {/* Identity + Security Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-20">
          <div className="lg:col-span-4">
            <IdentityCard total_orders={total_orders} customer={customer} storeId={storeId} />
          </div>
          <div className="lg:col-span-8">
            <SecurityMessage />
          </div>
        </div>

        <OrderPipelineQueue orders={orders} />
        <AcquisitionHistory purchased_products={purchased_products} />
      </div>
    </main>
  );
}
