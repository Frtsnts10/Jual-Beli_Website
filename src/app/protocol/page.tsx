import React from "react";
import Link from "next/link";
import { ArrowLeft, Network, ShieldAlert, Zap, Layers } from "lucide-react";
import { getStoreAction } from "@/features/stores/actions/store-actions";
import { Chip, Separator } from "@heroui/react";

export default async function ProtocolPage() {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!;
  const store = await getStoreAction(storeId);
  const storeName = store?.name || "Premium Storefront";

  const specs = [
    {
      title: "01. Instant Automated Delivery",
      icon: Network,
      desc: "Every digital subscription or product is delivered automatically. As soon as your payment is verified, your account credentials are securely generated and instantly available on your profile dashboard.",
      status: "Active"
    },
    {
      title: "02. Secure Checkout",
      icon: Zap,
      desc: "Our payment processing is fully encrypted and securely validated. We ensure your payment details are safe, and your products are allocated to you without delay.",
      status: "Operational"
    },
    {
      title: "03. High Availability",
      icon: Layers,
      desc: "To ensure you always have access to your purchased accounts, our systems are backed up across multiple servers. If any issues arise, our platform instantly reroutes to ensure zero downtime.",
      status: "Automated Failsafe"
    }
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="max-w-7xl mx-auto px-6 py-28 w-full flex-grow space-y-16">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Hero Section */}
        <div className="max-w-3xl space-y-6">
          <Chip
            variant="soft"
            size="sm"
            className="bg-blue-50 text-blue-700 border-none text-[9px] font-bold uppercase tracking-widest"
          >
            How It Works
          </Chip>
          <h1 className="text-4xl md:text-6xl font-black text-stone-900 tracking-tight uppercase">
            Our Delivery System
          </h1>
          <p className="text-stone-500 text-sm md:text-base leading-relaxed font-medium">
            Learn how our automated system delivers your digital products instantly and securely.
          </p>
        </div>

        <Separator className="bg-stone-200" />

        {/* Feature cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {specs.map((spec, i) => {
            const Icon = spec.icon;
            return (
              <div
                key={i}
                className="bg-white border border-stone-200 shadow-sm p-8 rounded-3xl flex flex-col justify-between min-h-[350px] hover:border-stone-300 transition-all duration-300"
              >
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest font-mono">
                    {spec.title}
                  </h3>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-medium">
                    {spec.desc}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200">
                  <span className="text-[8px] text-stone-500 font-bold uppercase tracking-widest font-mono">System State:</span>
                  <div className="flex items-center gap-1.5 text-[8px] bg-blue-50 text-blue-700 font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                    {spec.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* System console visualizer */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 font-mono space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">Order Fulfillment Process</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">SYSTEM ONLINE</span>
            </div>
          </div>
          <pre className="text-[10px] text-stone-300 overflow-x-auto leading-relaxed whitespace-pre font-bold select-none p-4 bg-black/30 rounded-2xl">
{`   [SELECT PRODUCT] ────► [SECURE CHECKOUT] ────► [PAYMENT VERIFIED] ────► [INSTANT DELIVERY]
          │                                                                      ▲
          └─────────────► [AUTOMATED STOCK RESERVATION] ─────────────────────────┘

   • STOREFRONT SYSTEM: OPERATIONAL | UPTIME: 99.99%
   • DELIVERY ENGINE: OPERATIONAL | AVG SPEED: < 1s
   • SUPPORT DESK: ONLINE | AVG RESPONSE: < 5m`}
          </pre>
          <div className="flex items-center gap-2.5 text-[8px] text-stone-400 font-black uppercase tracking-widest">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
            All transactions are securely processed and encrypted.
          </div>
        </div>
      </div>

      <footer className="border-t border-stone-200 px-6 py-8 text-center text-stone-400 text-sm">
        <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
