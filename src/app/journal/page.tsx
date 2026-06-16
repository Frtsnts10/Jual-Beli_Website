import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getStoreAction } from "@/features/stores/actions/store-actions";
import { getAuthenticatedUser } from "@/lib/firebase/server";
import { Chip, Separator } from "@heroui/react";

interface JournalEntry {
  version: string;
  title: string;
  date: string;
  category: "Deploy" | "Security" | "Refactor";
  categoryBg: string;
  categoryText: string;
  highlights: string[];
}

const ENTRIES: JournalEntry[] = [
  {
    version: "v3.0.0",
    title: "Firebase Migration & Xendit Integration",
    date: "May 30, 2026",
    category: "Deploy",
    categoryBg: "bg-indigo-500/10",
    categoryText: "text-indigo-400",
    highlights: [
      "Migrated entire backend from Supabase to Firebase Firestore + Firebase Auth.",
      "Integrated Xendit payment gateway for SaaS billing and product checkouts.",
      "Implemented session cookie authentication via Firebase Admin SDK.",
      "Rebuilt all server actions to use Firestore document-based queries."
    ]
  },
  {
    version: "v2.4.0",
    title: "Obsidian UI Core & Shards Vault Matrix",
    date: "May 18, 2026",
    category: "Deploy",
    categoryBg: "bg-indigo-500/10",
    categoryText: "text-indigo-400",
    highlights: [
      "Deployed dynamic Order Pipeline Queue tracking system for checkouts progress.",
      "Released secure client vault encryption card layouts with copy feedback buttons.",
      "Fixed UTC date formatting SSR mismatches across client browsers.",
      "Integrated live database latencies measuring actual query responses."
    ]
  },
  {
    version: "v2.2.0",
    title: "Firebase Auth & Firestore Security Gates",
    date: "May 14, 2026",
    category: "Security",
    categoryBg: "bg-emerald-500/10",
    categoryText: "text-emerald-400",
    highlights: [
      "Migrated full storefront schemas from Mock models to persistent Firestore collections.",
      "Established administrative server actions with Firebase Admin SDK.",
      "Integrated native Firebase Email Authentication routing logic.",
      "Normalized IDR Rupiah and USD decimal precision displays."
    ]
  },
  {
    version: "v2.0.0",
    title: "Decentralized Cart State & LocalStorage Persistence",
    date: "May 09, 2026",
    category: "Refactor",
    categoryBg: "bg-amber-500/10",
    categoryText: "text-amber-400",
    highlights: [
      "Created React Context CartProvider persisting user carts in localStorage.",
      "Released Bento-style CartDrawer layout displaying items with smooth slide triggers.",
      "Standardized atomic React state callbacks on cart items quantity updates.",
      "Added zero-rounding totals computation displaying premium checkout prices."
    ]
  }
];

export default async function JournalPage() {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!;
  const store = await getStoreAction(storeId);
  const storeName = store?.name || "Premium Storefront";

  const decoded = await getAuthenticatedUser();
  const user = decoded ? { email: decoded.email, uid: decoded.uid, name: decoded.name } : null;

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col justify-between">
      {/* Background spotlights */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <Navbar user={user} storeName={storeName} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-28 w-full flex-grow space-y-16">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Terminal
        </Link>

        {/* Hero Header */}
        <div className="max-w-3xl space-y-6">
          <Chip
            variant="soft"
            size="sm"
            className="bg-indigo-500/10 text-indigo-400 border-none text-[9px] font-bold uppercase tracking-widest"
          >
            Changelog Logs
          </Chip>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase flex items-center gap-4">
            <BookOpen className="w-10 h-10 text-indigo-400" />
            Platform Journal
          </h1>
          <p className="text-zinc-500 text-sm md:text-base leading-relaxed font-medium">
            Chronological logging of core storefront improvements, cryptographic updates, database schemas, and UX deployments.
          </p>
        </div>

        <Separator className="bg-white/5" />

        {/* Vertical Timeline logs stream */}
        <div className="max-w-4xl space-y-12">
          {ENTRIES.map((entry, idx) => (
            <div key={idx} className="relative pl-8 sm:pl-12 border-l border-white/5 pb-4">
              {/* Floating Node Bullet */}
              <div className="absolute -left-3 top-1 w-6 h-6 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
              </div>

              {/* Entry Card */}
              <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-3xl backdrop-blur-sm space-y-6 hover:border-white/10 transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-indigo-400 font-mono tracking-wider">{entry.version}</span>
                      <Chip
                        variant="soft"
                        size="sm"
                        className={`${entry.categoryBg} ${entry.categoryText} border-none text-[8px] font-bold uppercase tracking-widest`}
                      >
                        {entry.category}
                      </Chip>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                      {entry.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-500 font-mono text-[9px] font-bold uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5" />
                    {entry.date}
                  </div>
                </div>

                <Separator className="bg-white/5" />

                <div className="space-y-4">
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest font-mono">Updates Applied:</p>
                  <ul className="space-y-3.5">
                    {entry.highlights.map((highlight, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-3 text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
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
