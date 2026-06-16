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
      title: "01. Encrypted Shard Allocation Matrix",
      icon: Network,
      desc: "Every digital subscription or asset is treated as a cryptographic credential shard. Upon verification, the shard is split, encrypted using AES-256-GCM, and mapped directly to a client's isolated session vault. No direct user-to-node passwords ever persist.",
      status: "Active Protocol"
    },
    {
      title: "02. Zero-Knowledge Checkout Authorization",
      icon: Zap,
      desc: "Payment processing and delivery triggers are validated through an off-chain Zero-Knowledge proof mechanism. This establishes instant asset allocation immediately upon webhook broadcast without relying on central escrow authorization databases.",
      status: "Operational"
    },
    {
      title: "03. Decentralized Mirror Sync Failsafes",
      icon: Layers,
      desc: "To prevent subscription interruptions, credentials shards are mirrored across 12 independent, geographically-isolated nodes. If a single node reports a heartbeat anomaly, the platform instantly re-encrypts and shifts allocations to operational nodes.",
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
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Terminal
        </Link>

        {/* Hero Section */}
        <div className="max-w-3xl space-y-6">
          <Chip
            variant="soft"
            size="sm"
            className="bg-indigo-500/10 text-indigo-400 border-none text-[9px] font-bold uppercase tracking-widest"
          >
            System Specs Whitepaper
          </Chip>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase">
            Obsidian Protocol Mesh
          </h1>
          <p className="text-zinc-500 text-sm md:text-base leading-relaxed font-medium">
            Read the technical schematics and security blueprints guiding our automated digital assets delivery, vault encryption, and decentralized node infrastructure.
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
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Active Shards Route Visualizer</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">LIVE MESH SYNC</span>
            </div>
          </div>
          <pre className="text-[10px] text-zinc-400 overflow-x-auto leading-relaxed whitespace-pre font-bold select-none p-4 bg-zinc-950/50 rounded-2xl">
{`   [CLIENT COMPASS] ────► [ZK AUTHC PORTAL] ────► [VAULT KEY DECRYPT] ────► [SHARD RENDER]
          │                                                                      ▲
          └─────────────► [12x PEER MIRRORS (FAILSAFE ACTIVE)] ──────────────────┘

   • NODE CLUSTER #01: OPERATIONAL | HEARTBEAT: 22ms | PARITY: 100%
   • NODE CLUSTER #02: OPERATIONAL | HEARTBEAT: 16ms | PARITY: 100%
   • NODE CLUSTER #03: OPERATIONAL | HEARTBEAT: 34ms | PARITY: 100%`}
          </pre>
          <div className="flex items-center gap-2.5 text-[8px] text-zinc-600 font-black uppercase tracking-widest">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
            Security Shielding Mesh Enabled across all active virtual interfaces.
          </div>
        </div>
      </div>

      <Footer 
        storeName={storeName} 
        storeEmail={store?.email}
        storeInstagram={store?.instagram}
        storeWhatsapp={store?.whatsapp}
      />
    </main>
  );
}
