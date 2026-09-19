import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Shield, BookOpen, FileCheck, ArrowLeft, Cpu } from "lucide-react";
import { getStoreAction } from "@/features/stores/actions/store-actions";
import { getActiveStoreId } from "@/lib/get-store-id";
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
    subtitle: "Our Commitment to Your Privacy.",
    icon: Shield,
    chip: "Policy 01",
    sections: [
      {
        title: "01. Data Collection Policy",
        desc: "We enforce a strict data privacy policy. Your personal information, including email addresses and checkout details, is secured using industry-standard encryption. We only collect the data necessary to process your orders."
      },
      {
        title: "02. Account Protection",
        desc: "Your active sessions and account details are securely isolated. When accessing your shared accounts or subscriptions, your authentication is verified securely to prevent unauthorized access."
      },
      {
        title: "03. Third-Party Sharing",
        desc: "We do not sell, rent, or lease your personal data to third parties. Any operational data collected is aggregated anonymously to improve our services and deleted automatically."
      }
    ]
  },
  "terms-of-use": {
    title: "Terms of Use",
    subtitle: "General Terms and Conditions.",
    icon: BookOpen,
    chip: "Terms 01",
    sections: [
      {
        title: "01. User Eligibility",
        desc: "By accessing our storefront, you verify that you are legally authorized to make purchases and agree to comply with our general terms and service boundaries."
      },
      {
        title: "02. Account Usage",
        desc: "Accounts and shared slots purchased are strictly for the authorized buyer. Resale, automated duplication, or abusive behavior will result in automatic account termination."
      },
      {
        title: "03. Service Guarantees",
        desc: "Our digital products are provided 'as-is' directly from our verified stock. While we guarantee high uptime for our delivery system, any disputes should be handled through our customer support channels."
      }
    ]
  },
  "security": {
    title: "Security Policy",
    subtitle: "How We Protect Your Data.",
    icon: Cpu,
    chip: "Security 01",
    sections: [
      {
        title: "01. Secure Transactions",
        desc: "All sensitive information and account credentials undergo strict encryption before being stored in our database. We utilize modern security standards to protect your purchases."
      },
      {
        title: "02. Safe Browsing",
        desc: "Your browsing sessions and sensitive data are never permanently cached. Any copy-to-clipboard interactions expire quickly to ensure your account security."
      },
      {
        title: "03. Reliable Uptime",
        desc: "Our store and order records are continuously backed up across secure servers. In the event of an outage, backup systems instantly reroute traffic to ensure you never lose access."
      }
    ]
  },
  "compliance": {
    title: "Compliance",
    subtitle: "Store Policies and Guidelines.",
    icon: FileCheck,
    chip: "Policy 02",
    sections: [
      {
        title: "01. Digital Product Standards",
        desc: "We operate in compliance with standard e-commerce regulations. All digital subscriptions and shared accounts conform to our strict quality guidelines."
      },
      {
        title: "02. Payment Processing",
        desc: "We process payments precisely and transparently. We enforce strict currency formatting and conduct regular audits to ensure there are no hidden fees."
      },
      {
        title: "03. Dispute Resolution",
        desc: "Any issues with your digital accounts are handled swiftly by our support team. Verified operational failures will trigger immediate replacements or refunds."
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

  const storeId = await getActiveStoreId();
  const store = storeId ? await getStoreAction(storeId) : null;
  const storeName = store?.name || "Premium Storefront";

  const Icon = doc.icon;

  return (
    <div className="flex-1 flex flex-col">
      <div className="max-w-7xl mx-auto px-6 py-28 w-full flex-grow">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-[10px] font-black uppercase tracking-widest mb-12">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 items-start">
          {/* Sidebar Navigation */}
          <div className="space-y-4 lg:sticky lg:top-28">
            <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest ml-1 mb-6">Legal Documents</p>
            <div className="flex flex-col gap-2">
              {Object.entries(LEGAL_DOCS).map(([key, item]) => {
                const isActive = key === slug;
                return (
                  <Link
                    key={key}
                    href={`/legal/${key}`}
                    className={`p-4 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-300"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Document Content */}
          <div className="lg:col-span-3 space-y-10 bg-white border border-stone-200 shadow-sm p-8 sm:p-12 rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-stone-200">
              <div className="space-y-3">
                <Chip
                  variant="soft"
                  size="sm"
                  className="bg-blue-50 text-blue-700 border-none text-[9px] font-bold uppercase tracking-widest"
                >
                  {doc.chip}
                </Chip>
                <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight uppercase flex items-center gap-3">
                  <Icon className="w-8 h-8 text-blue-600" />
                  {doc.title}
                </h1>
                <p className="text-stone-500 text-xs sm:text-sm font-medium">{doc.subtitle}</p>
              </div>
            </div>

            <div className="space-y-12">
              {doc.sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest font-mono">
                    {section.title}
                  </h3>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-sans font-medium">
                    {section.desc}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="bg-stone-200" />

            <div className="flex items-center gap-2.5 text-[9px] text-stone-500 font-black uppercase tracking-widest font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified Secure Document
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-stone-200 px-6 py-8 text-center text-stone-400 text-sm">
        <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
