"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { navControl } from "@/lib/ui";
import { cart, useCart } from "./cart-store";

/** Adds one unit; briefly shows "Ditambahkan". `compact` is the icon-only version for product cards. */
export function AddToCart({ storeId, productId, className, compact = false }: { storeId: string; productId: string; className?: string; compact?: boolean }) {
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(t);
  }, [added]);
  const Icon = added ? Check : ShoppingCart;
  return (
    <button
      type="button"
      aria-label={compact ? "Tambah ke keranjang" : undefined}
      title="Tambah ke keranjang"
      onClick={(e) => {
        e.preventDefault();
        cart.add(storeId, productId);
        setAdded(true);
      }}
      className={cn("relative z-[2] inline-flex items-center justify-center gap-2", className)}
    >
      <Icon className="size-4" />
      {!compact && (added ? "Ditambahkan" : "Tambah ke keranjang")}
    </button>
  );
}

/** Header cart link with the number of items. */
export function CartNavButton({ storeId, href }: { storeId: string; href: string }) {
  const items = useCart(storeId);
  const count = items.reduce((s, i) => s + i.qty, 0);
  return (
    <Link href={href} aria-label={count ? `Keranjang, ${count} item` : "Keranjang"} className={cn(navControl, "t-btn-line relative w-9 bg-white")}>
      <ShoppingCart className="size-4" />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-5 rounded-[var(--r-pill)] bg-[var(--accent)] px-1 text-center text-[10px] leading-5 font-semibold text-[var(--accent-fg)]">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
