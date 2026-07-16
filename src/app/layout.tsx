import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { Navbar } from "@/components/navbar";
import { getStore } from "@/features/stores/api";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore();
  const storeName = store?.name || "STORE";

  return {
    title: `${storeName}.`,
    description: "Lightweight. Premium.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const store = await getStore();
  const storeName = store?.name || "STORE";

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} font-sans antialiased bg-neutral-950 text-neutral-50 min-h-screen selection:bg-blue-500 selection:text-white transition-colors overflow-x-hidden flex flex-col`}>
        <Providers>
          <Navbar storeName={storeName} />
          {children}
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
