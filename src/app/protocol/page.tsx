import React from "react";
import Link from "next/link";
import { Cpu, ArrowLeft, Network, ShieldAlert, Zap, Layers } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getStoreAction } from "@/features/stores/actions/store-actions";
import { getAuthenticatedUser } from "@/lib/firebase/server";
import { Chip, Separator } from "@heroui/react";

export default async function ProtocolPage() {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!;
  const store = await getStoreAction(storeId);
  const storeName = store?.name || "Premium Storefront";

  const decoded = await getAuthenticatedUser();
  const user = decoded ? { email: decoded.email, uid: decoded.uid, name: decoded.name } : null;

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
    <main className="min-h-screen bg-zinc-950 flex flex-col justify-between">
      {/* Dynamic Ambient Spotlights */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <Navbar user={user} storeName={storeName} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-28 w-full flex-grow space-y-16">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Hero Section */}
        <div className="max-w-3xl space-y-6">
          <Chip
            variant="soft"
            size="sm"
            className="bg-indigo-500/10 text-indigo-400 border-none text-[9px] font-bold uppercase tracking-widest"
          >
            How It Works
          </Chip>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase">
            Our Delivery System
          </h1>
          <p className="text-zinc-500 text-sm md:text-base leading-relaxed font-medium">
            Learn how our automated system delivers your digital products instantly and securely.
          </p>
        </div>

        <Separator className="bg-white/5" />

        {/* Technical Schematics Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {specs.map((spec, i) => {
            const Icon = spec.icon;
            return (
              <div
                key={i}
                className="bg-zinc-900/30 border border-white/5 p-8 rounded-3xl backdrop-blur-sm flex flex-col justify-between min-h-[350px] hover:border-white/10 transition-all duration-300"
              >
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest font-mono">
                    {spec.title}
                  </h3>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-medium">
                    {spec.desc}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest font-mono">System State:</span>
                  <div className="flex items-center gap-1.5 text-[8px] bg-indigo-500/10 text-indigo-400 font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                    {spec.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Monospace System Node Console Visualizer */}
        <div className="bg-black/40 border border-white/5 rounded-3xl p-8 font-mono space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Order Fulfillment Process</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">SYSTEM ONLINE</span>
            </div>
          </div>
          <pre className="text-[10px] text-zinc-400 overflow-x-auto leading-relaxed whitespace-pre font-bold select-none p-4 bg-zinc-950/50 rounded-2xl">
{`   [SELECT PRODUCT] ────► [SECURE CHECKOUT] ────► [PAYMENT VERIFIED] ────► [INSTANT DELIVERY]
          │                                                                      ▲
          └─────────────► [AUTOMATED STOCK RESERVATION] ─────────────────────────┘

   • STOREFRONT SYSTEM: OPERATIONAL | UPTIME: 99.99%
   • DELIVERY ENGINE: OPERATIONAL | AVG SPEED: < 1s
   • SUPPORT DESK: ONLINE | AVG RESPONSE: < 5m`}
          </pre>
          <div className="flex items-center gap-2.5 text-[8px] text-zinc-600 font-black uppercase tracking-widest">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
            All transactions are securely processed and encrypted.
          </div>
        </div>
      </div>

      <Footer 
        storeName={storeName} 
        storeEmail={store?.email}
        storeInstagram={store?.instagram}
        storeWhatsapp={store?.whatsapp}
        storeBio={store?.bio}
      />
    </main>
  );
}
