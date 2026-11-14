import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toko Digital",
  description: "Etalase produk digital dengan checkout instan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
