"use client";

import { CartProvider } from "@/features/cart/context/cart-context";
import { MidtransProvider } from "./providers/midtrans-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <MidtransProvider />
    </CartProvider>
  );
}
