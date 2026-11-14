import Link from "next/link";
import { formatIDR } from "@/lib/utils";
import type { StoreProduct } from "./types";

export const isSoldOut = (p: StoreProduct) => p.stock_available < 1;

export function Price({ product, className }: { product: StoreProduct; className?: string }) {
  return <span className={className}>{formatIDR(product.price)}</span>;
}

export function BuyButton({ product, className, children }: { product: StoreProduct; className?: string; children?: React.ReactNode }) {
  if (isSoldOut(product)) {
    return <span className={`${className} pointer-events-none opacity-40`}>Stok habis</span>;
  }
  return (
    <Link href={product.href} className={className}>
      {children ?? "Beli Langsung"}
    </Link>
  );
}

export function StoreFooter({ storeName, trackHref, className = "" }: { storeName: string; trackHref: string; className?: string }) {
  return (
    <footer className={`mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-10 text-sm ${className}`}>
      <span>© {new Date().getFullYear()} {storeName}</span>
      <Link href={trackHref} className="underline underline-offset-4">
        Lacak pesanan & klaim garansi
      </Link>
    </footer>
  );
}

export function EmptyCatalog({ className = "" }: { className?: string }) {
  return <p className={`py-20 text-center ${className}`}>Belum ada produk yang dijual.</p>;
}
