"use client";

/* eslint-disable @next/next/no-img-element -- seller-supplied logo URL */
import { useState } from "react";
import Link from "next/link";
import { Menu, MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navControl } from "@/lib/ui";

export interface NavLink {
  href: string;
  label: string;
}

/** Brutalist gets its own loud styling; every other template shares the clean bar. */
export type ChromeVariant = "clean" | "brutalist";

const BAR: Record<ChromeVariant, string> = {
  clean: "border-b border-neutral-200/80 bg-white/85 text-neutral-900 backdrop-blur supports-[backdrop-filter]:bg-white/70",
  brutalist: "border-b-4 border-black bg-white font-mono text-black",
};

/** Sticky store header: name/logo, section links, and (on phones) a slide-down menu. */
export function StoreNav({
  storeName,
  logoUrl,
  homeHref,
  links,
  actions,
  variant,
}: {
  storeName: string;
  logoUrl?: string;
  homeHref: string;
  links: NavLink[];
  /** Right-hand slot (account / sign-in), rendered on every size. */
  actions?: React.ReactNode;
  variant: ChromeVariant;
}) {
  const [open, setOpen] = useState(false);

  const linkCls = variant === "brutalist" ? "font-bold uppercase hover:underline" : "text-neutral-600 hover:text-neutral-900";
  return (
    <header className={cn("sticky top-0 z-40 print:hidden", BAR[variant])}>
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href={homeHref} className="flex min-w-0 items-center gap-2">
          {logoUrl && <img src={logoUrl} alt="" className="size-8 shrink-0 rounded-md object-cover" />}
          <span className={cn("truncate font-semibold", variant === "brutalist" && "font-black uppercase")}>{storeName}</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-5 text-sm md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkCls}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {actions}
          <button
            type="button"
            className={cn(navControl, "t-btn-line w-9 bg-white md:hidden")}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className={cn("grid border-t px-4 py-2 text-sm md:hidden", variant === "brutalist" ? "border-black" : "border-neutral-200")}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={cn("py-2.5", linkCls)} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function StoreFooter({ storeName, links, variant, chatButton = false }: { storeName: string; links: NavLink[]; variant: ChromeVariant; chatButton?: boolean }) {
  return (
    <footer className={cn("print:hidden", variant === "brutalist" ? "border-t-4 border-black bg-white font-mono font-bold" : "border-t border-neutral-200 bg-white text-neutral-500")}>
      {/* With the floating chat button, extra room at the bottom so it never covers the links. */}
      <div className={cn("mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6", chatButton && "pb-24 sm:pb-8 sm:pr-48")}>
        <span>
          © {new Date().getFullYear()} {storeName}
        </span>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-neutral-900 hover:underline">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

/** Floating "chat the seller" button, bottom-right, above everything but the phone menu. */
export function WhatsAppButton({ phone, storeName }: { phone: string; storeName: string }) {
  const text = encodeURIComponent(`Halo ${storeName}, saya mau tanya tentang produk di toko Anda.`);
  return (
    <a
      href={`https://wa.me/${phone.replace(/\D/g, "")}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat penjual di WhatsApp"
      className="t-pill t-btn fixed right-4 bottom-4 z-30 flex print:hidden items-center gap-2 bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <MessageCircle className="size-5" />
      <span className="hidden sm:inline">Chat penjual</span>
    </a>
  );
}
