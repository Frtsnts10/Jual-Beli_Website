import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Shield, BookOpen, AlertCircle, FileCheck, ArrowLeft, Cpu } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getStoreAction } from "@/features/stores/actions/store-actions";
import { getAuthenticatedUser } from "@/lib/firebase/server";
import { Chip, Separator } from "@heroui/react";

interface LegalDoc {
  title: string;
  subtitle: string;
  icon: any;
  chip: string;
  sections: { title: string; desc: string }[];
}

const LEGAL_DOCS: Record<string, LegalDoc> = {
  "privacy-policy": {
    title: "Privacy Policy",
    subtitle: "Zero-Trace Cryptographic Privacy Standard.",
    icon: Shield,
    chip: "Protocol 09-A",
    sections: [
      {
        title: "01. Zero-Knowledge Node Policy",
        desc: "We enforce an absolute zero-trace identity policy. Your credentials, including email shards and checkout payloads, are secured using military-grade client-side key hashes. No plain-text data ever touches local log buffers."
      },
      {
        title: "02. Symmetric Vault Protection",
        desc: "Active profile session states are client-isolated. When retrieving access tokens or pool allocations, authentication is verified via off-chain ZK gates, completely preventing IP leakages or tracking footprints."
      },
      {
        title: "03. External Node Compliance",
        desc: "We do not sell, rent, or lease our transaction ledgers to third-party data collection agents. Operational telemetry is aggregated anonymously and pruned automatically every 72 hours."
      }
    ]
  },
  "terms-of-use": {
    title: "Terms of Use",
    subtitle: "Decentralized Operator Charter and Parameters.",
    icon: BookOpen,
    chip: "Charter 02",
    sections: [
      {
        title: "01. Operator Eligibility",
        desc: "By establishing an active connection node with this storefront, you verify that you hold legal authority over your local internet terminal and agree to comply with system-wide shard boundary specifications."
      },
      {
        title: "02. Allocation Thresholds",
        desc: "Accounts and pool slots checked out via the Cart Matrix are strictly bounded to the authorized purchasing operator profile. Automated duplication, credential resale, or botting the protocol interface will trigger automatic session prunes."
      },
      {
        title: "03. SLA and Failsafes",
        desc: "Curated digital assets are provided 'as-is' under decentralized authority. While our operational node matrix guarantees 99.99% uptime, merchant disputes are gated through the automatic timeline dashboard."
      }
    ]
  },
  "security": {
    title: "Security Specs",
    subtitle: "Obsidian Cryptographic Mesh Specifications.",
    icon: Cpu,
    chip: "Specs 256",
    sections: [
      {
        title: "01. AES-256 Symmetric Pipelines",
        desc: "All stored database assets and account vault credentials undergo dual-layer symmetric encryption before being committed to Firestore persistent cells. Master decryption keys are dynamically fragmented using multi-signature shards."
      },
      {
        title: "02. Isolated Session Sandboxes",
        desc: "Decrypted keys are never fully cached in client memory. Copy-to-clipboard interactions use isolated, garbage-collected string buffers that automatically expire and clear to protect active operator nodes."
      },
      {
        title: "03. Distributed Mirroring",
        desc: "Our transaction catalog and order records are continuously mirrored across 12 distributed node nodes. In the event of a cluster interrupt, backup pathways instantly re-route profile traffic."
      }
    ]
  },
  "compliance": {
    title: "Compliance Matrix",
    subtitle: "Decentralized Jurisdiction & Token Policy.",
    icon: FileCheck,
    chip: "Compliance 88",
    sections: [
      {
        title: "01. International Digital Asset Standards",
        desc: "Obsidian operates in absolute compliance with globally recognized distributed commerce standards. All digital subscriptions, pools, and artifacts conform to the Virtual Asset Service Provider guidelines."
      },
      {
        title: "02. Multi-Currency Validation",
        desc: "We enforce precise, zero-rounding multi-currency parameters (including USD and IDR formatting) with active conversion audits, ensuring absolutely transparent billing without hidden decimal cuts."
      },
      {
        title: "03. Dispute Resolution Gating",
        desc: "Conflict mitigation is automated via the Merchant Dashboard timeline queue. Operational failures automatically trigger system notifications and direct access vault adjustments without manual escrow delays."
      }
    ]
  }
};

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = LEGAL_DOCS[slug];

  if (!doc) {
    return notFound();
  }

  const storeId = process.env.NEXT_PUBLIC_STORE_ID!;
  const store = await getStoreAction(storeId);
  const storeName = store?.name || "Premium Storefront";

  const decoded = await getAuthenticatedUser();
  const user = decoded ? { email: decoded.email, uid: decoded.uid, name: decoded.name } : null;

  const Icon = doc.icon;

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col justify-between">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <Navbar user={user} storeName={storeName} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-28 w-full flex-grow">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-12">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Terminal
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 items-start">
          {/* Sidebar Navigation */}
          <div className="space-y-4 lg:sticky lg:top-28">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 mb-6">Legal Protocol Docs</p>
            <div className="flex flex-col gap-2">
              {Object.entries(LEGAL_DOCS).map(([key, item]) => {
                const isActive = key === slug;
                return (
                  <Link
                    key={key}
                    href={`/legal/${key}`}
                    className={`p-4 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
                      isActive
                        ? "bg-white text-black border-white"
                        : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white hover:border-white/10"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Document Content */}
          <div className="lg:col-span-3 space-y-10 bg-zinc-900/30 border border-white/5 p-8 sm:p-12 rounded-3xl backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-white/5">
              <div className="space-y-3">
                <Chip
                  variant="flat"
                  size="sm"
                  className="bg-indigo-500/10 text-indigo-400 border-none text-[9px] font-bold uppercase tracking-widest"
                >
                  {doc.chip}
                </Chip>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                  <Icon className="w-8 h-8 text-indigo-400" />
                  {doc.title}
                </h1>
                <p className="text-zinc-500 text-xs sm:text-sm font-medium">{doc.subtitle}</p>
              </div>
            </div>

            <div className="space-y-12">
              {doc.sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest font-mono">
                    {section.title}
                  </h3>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-sans font-medium">
                    {section.desc}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="bg-white/5" />

            <div className="flex items-center gap-2.5 text-[9px] text-zinc-500 font-black uppercase tracking-widest font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified Cryptographic Authenticity Stamp Active
            </div>
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
