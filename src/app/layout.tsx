import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jual — Buka Toko Digital di belidi.biz.id",
  description: "Jual: etalase produk digital dengan keranjang, pembayaran QRIS dan pengiriman akun otomatis lewat WhatsApp.",
  applicationName: "Jual",
  // New file names (not app/icon.png) so browsers that cached the old Vercel favicon fetch the JB logo.
  icons: {
    icon: [{ url: "/brand/jual-icon.png", type: "image/png" }],
    shortcut: "/brand/jual-favicon.ico",
    apple: "/brand/jual-apple-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={GeistSans.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
