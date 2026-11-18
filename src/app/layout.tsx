import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jual — buka toko digital di belidi.biz.id",
  description: "Jual: etalase produk digital dengan keranjang, pembayaran QRIS dan pengiriman akun otomatis lewat WhatsApp.",
  applicationName: "Jual",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={GeistSans.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
