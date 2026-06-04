import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { CartDrawer } from "@/features/cart/components/cart-drawer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Obsidian — Premium Digital Commerce",
  description: "Secure, curated, and instantly accessible digital artifacts for the next generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-zinc-950 text-white antialiased overflow-x-hidden`}>
        <Providers>
          {children}
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
