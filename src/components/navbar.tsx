"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/features/cart/store";

export function Navbar({ storeName = "STORE" }: { storeName?: string }) {
  const { toggleCart, totalItems } = useCartStore();

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center mt-4 px-6 pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-between w-full max-w-5xl h-16 px-6 bg-neutral-950/70 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
        <Link href="/" className="text-xl font-bold tracking-tighter text-white uppercase">
          {storeName}<span className="text-blue-500">.</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/products" className="text-neutral-300 hover:text-white transition-colors">Products</Link>
          <Link href="/about" className="text-neutral-300 hover:text-white transition-colors">About</Link>
          <Link href="/faq" className="text-neutral-300 hover:text-white transition-colors">FAQ</Link>
        </nav>
        <Button 
          isIconOnly
          variant="ghost" 
          className="relative text-white hover:bg-white/10 rounded-full border-transparent"
          onPress={toggleCart}
        >
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </Button>
      </div>
    </header>
  );
}
