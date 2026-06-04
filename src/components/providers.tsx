"use client";

import { CartProvider } from "@/features/cart/context/cart-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}
