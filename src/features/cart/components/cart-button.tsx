"use client";

import React from "react";
import { useCart } from "../context/cart-context";
import { ShoppingBag } from "lucide-react";
import { Button } from "@heroui/react";

export function CartButton() {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <div className="relative">
      <Button
        isIconOnly
        variant="outline"
        size="sm"
        onPress={() => setIsCartOpen(true)}
        className="border-white/10 bg-white/5 text-zinc-400 hover:text-white rounded-xl w-8 h-8 min-w-0"
        aria-label="Open cart"
      >
        <ShoppingBag className="w-4 h-4" />
      </Button>
      {totalItems > 0 && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center pointer-events-none">
          <span className="text-[9px] font-black text-white leading-none">{totalItems}</span>
        </div>
      )}
    </div>
  );
}
