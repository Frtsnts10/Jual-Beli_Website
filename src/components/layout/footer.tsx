"use client";

import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { Separator } from "@heroui/react";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface FooterProps {
  storeName: string;
  storeEmail?: string | null;
  storeInstagram?: string | null;
  storeWhatsapp?: string | null;
  storeBio?: string | null;
}

export function Footer({ storeName, storeEmail, storeInstagram, storeWhatsapp, storeBio }: FooterProps) {
  const initial = storeName[0]?.toUpperCase() || "S";
  const year = new Date().getFullYear();

  // Create clean fallbacks if not configured in dashboard
  const emailVal = storeEmail || `support@${storeName.toLowerCase().replace(/\s+/g, "")}.com`;
  const instagramVal = storeInstagram || storeName.toLowerCase().replace(/\s+/g, "");
  const whatsappVal = storeWhatsapp || "1234567890";

  return (
    <footer className="relative z-10 border-t border-white/5 bg-zinc-900/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black text-lg">
                {initial}
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-xs tracking-widest uppercase text-white">
                  {storeName.split(" ")[0]}
                </span>
                <span className="font-semibold text-[10px] tracking-widest uppercase text-zinc-500 mt-1">
                  {storeName.split(" ").slice(1).join(" ") || "Storefront"}
                </span>
              </div>
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-xs font-medium">
              {storeBio || "Premium digital commerce infrastructure built for the next generation of artifacts and digital assets."}
            </p>
            <div className="flex items-center gap-3 mt-8">
              {[
                { 
                  Icon: InstagramIcon, 
                  href: instagramVal.startsWith("http") ? instagramVal : `https://instagram.com/${instagramVal}`, 
                  target: "_blank", 
                  rel: "noopener noreferrer" 
                },
                { 
                  Icon: FaWhatsapp, 
                  href: whatsappVal.startsWith("http") ? whatsappVal : `https://wa.me/${whatsappVal.replace(/\+/g, "")}`, 
                  target: "_blank", 
                  rel: "noopener noreferrer" 
                },
                { 
                  Icon: Mail, 
                  href: emailVal.startsWith("mailto:") ? emailVal : `mailto:${emailVal}`, 
                  target: "_self", 
                  rel: "" 
                }
              ].map(({ Icon, href, target, rel }, i) => (
                <a
                  key={i}
                  href={href}
                  target={target}
                  rel={rel}
                  className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6">Platform</p>
            <div className="flex flex-col gap-4">
              {[
                { label: "Collection", href: "/#collection" },
                { label: "Updates", href: "/journal" },
                { label: "How It Works", href: "/protocol" },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="text-xs text-zinc-400 hover:text-white transition-colors font-medium uppercase tracking-widest">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6">Legal</p>
            <div className="flex flex-col gap-4">
              {[
                { label: "Privacy Policy", href: "/legal/privacy-policy" },
                { label: "Terms of Use", href: "/legal/terms-of-use" },
                { label: "Security", href: "/legal/security" },
                { label: "Compliance", href: "/legal/compliance" },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="text-xs text-zinc-400 hover:text-white transition-colors font-medium uppercase tracking-widest">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Separator className="bg-white/5 mb-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-600 font-medium">
            © {year} {storeName}. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-zinc-600 font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
