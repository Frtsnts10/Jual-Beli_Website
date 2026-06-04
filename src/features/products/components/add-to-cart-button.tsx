"use client";

import React from "react";
import { useCart } from "@/features/cart/context/cart-context";
import { Product } from "../actions/product-actions";
import { ShoppingCart, Loader2 } from "lucide-react";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const { addToCart, setIsCartOpen } = useCart();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAdd = () => {
    setIsLoading(true);
    setTimeout(() => {
      addToCart(product);
      setIsCartOpen(true);
      setIsLoading(false);
    }, 400);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={isLoading}
      className={`w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${className || ""}`}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          Secure Acquisition
        </>
      )}
    </button>
  );
}
