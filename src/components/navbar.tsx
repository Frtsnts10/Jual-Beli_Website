"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { ShoppingCart, Search } from "lucide-react";
import { useCartStore } from "@/features/cart/store";

export function Navbar({ storeName = "STORE" }: { storeName?: string }) {
  const { toggleCart, totalItems } = useCartStore();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto flex items-center gap-6 px-6 lg:px-16 h-20">
        <Link href="/" className="shrink-0 text-[19px] font-extrabold tracking-tight text-stone-900">
          {storeName}<span className="text-blue-600">.</span>
        </Link>

        <div className="hidden md:flex flex-1 items-center gap-2.5 max-w-md bg-white border border-stone-200 rounded-xl px-4 py-2.5">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <span className="text-sm text-stone-400 truncate">Search Netflix, Spotify, Canva...</span>
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-[13.5px] font-semibold text-stone-700 ml-auto">
          <Link href="/products" className="hover:text-stone-950 transition-colors">All Products</Link>
          <Link href="/profile" className="hover:text-stone-950 transition-colors">Track Order</Link>
        </nav>

        <Button
          isIconOnly
          variant="ghost"
          className="relative text-stone-800 hover:bg-stone-100 rounded-xl ml-2 lg:ml-0 shrink-0"
          onPress={toggleCart}
          aria-label="Open cart"
        >
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
}
