"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { CartProvider } from "@/features/cart/context/cart-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <NextThemesProvider attribute="class" defaultTheme="light">
      <CartProvider>
        {children}
      </CartProvider>
    </NextThemesProvider>
  );
}
