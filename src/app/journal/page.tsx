import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, CheckCircle2 } from "lucide-react";
import { getStoreAction } from "@/features/stores/actions/store-actions";
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
    title: "Firebase Migration & Midtrans Integration",
    date: "May 30, 2026",
    category: "Deploy",
    categoryBg: "bg-blue-50",
    categoryText: "text-blue-700",
    highlights: [
      "Migrated entire backend from Supabase to Firebase Firestore + Firebase Auth.",
      "Integrated Midtrans payment gateway for automated order processing.",
      "Implemented session cookie authentication via Firebase Admin SDK.",
      "Rebuilt all server actions to use Firestore document-based queries."
    ]
  },
  {
    version: "v2.4.0",
    title: "Order Tracking & Account Delivery",
    date: "May 18, 2026",
    category: "Deploy",
    categoryBg: "bg-blue-50",
    categoryText: "text-blue-700",
    highlights: [
      "Deployed dynamic order tracking system for checkout progress.",
      "Released secure account credential cards with copy feedback buttons.",
      "Fixed UTC date formatting mismatches across client browsers.",
      "Integrated live database latency measurements for query responses."
    ]
  },
  {
    version: "v2.2.0",
    title: "Firebase Auth & Firestore Security",
    date: "May 14, 2026",
    category: "Security",
    categoryBg: "bg-emerald-50",
    categoryText: "text-emerald-700",
    highlights: [
      "Migrated full storefront schemas to persistent Firestore collections.",
      "Established administrative server actions with Firebase Admin SDK.",
      "Integrated native Firebase Email Authentication routing logic.",
      "Normalized IDR Rupiah and USD decimal precision displays."
    ]
  },
  {
    version: "v2.0.0",
    title: "Cart State & LocalStorage Persistence",
    date: "May 09, 2026",
    category: "Refactor",
    categoryBg: "bg-amber-50",
    categoryText: "text-amber-700",
    highlights: [
      "Created React Context CartProvider persisting user carts in localStorage.",
      "Released cart drawer layout displaying items with smooth slide triggers.",
      "Standardized atomic React state callbacks on cart item quantity updates.",
      "Added zero-rounding totals computation for checkout prices."
    ]
  }
];

export default async function JournalPage() {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!;
  const store = await getStoreAction(storeId);
  const storeName = store?.name || "Premium Storefront";

  return (
    <div className="flex-1 flex flex-col">
      <div className="max-w-7xl mx-auto px-6 py-28 w-full flex-grow space-y-16">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Hero Header */}
        <div className="max-w-3xl space-y-6">
          <Chip
            variant="soft"
            size="sm"
            className="bg-blue-50 text-blue-700 border-none text-[9px] font-bold uppercase tracking-widest"
          >
            Store Updates
          </Chip>
          <h1 className="text-4xl md:text-6xl font-black text-stone-900 tracking-tight uppercase flex items-center gap-4">
            <BookOpen className="w-10 h-10 text-blue-600" />
            Latest Updates
          </h1>
          <p className="text-stone-500 text-sm md:text-base leading-relaxed font-medium">
            Stay up to date with our latest product additions, platform improvements, and store news.
          </p>
        </div>

        <Separator className="bg-stone-200" />

        {/* Vertical Timeline logs stream */}
        <div className="max-w-4xl space-y-12">
          {ENTRIES.map((entry, idx) => (
            <div key={idx} className="relative pl-8 sm:pl-12 border-l border-stone-200 pb-4">
              {/* Floating Node Bullet */}
              <div className="absolute -left-3 top-1 w-6 h-6 rounded-full bg-white border border-stone-200 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
              </div>

              {/* Entry Card */}
              <div className="bg-white border border-stone-200 shadow-sm p-8 rounded-3xl space-y-6 hover:border-stone-300 transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-blue-600 font-mono tracking-wider">{entry.version}</span>
                      <Chip
                        variant="soft"
                        size="sm"
                        className={`${entry.categoryBg} ${entry.categoryText} border-none text-[8px] font-bold uppercase tracking-widest`}
                      >
                        {entry.category}
                      </Chip>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-stone-900 uppercase tracking-tight">
                      {entry.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-stone-500 font-mono text-[9px] font-bold uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5" />
                    {entry.date}
                  </div>
                </div>

                <Separator className="bg-stone-200" />

                <div className="space-y-4">
                  <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest font-mono">Updates Applied:</p>
                  <ul className="space-y-3.5">
                    {entry.highlights.map((highlight, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-3 text-stone-600 text-xs sm:text-sm font-medium leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
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

      <footer className="border-t border-stone-200 px-6 py-8 text-center text-stone-400 text-sm">
        <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
