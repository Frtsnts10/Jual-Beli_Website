import Link from "next/link";
import { formatIDR } from "@/lib/utils";
import { Star } from "lucide-react";
import { Countdown } from "@/components/countdown";
import { ratingSummary } from "@/lib/rating";
import { cn } from "@/lib/utils";
import type { StoreProduct } from "./types";
import { AddToCart } from "@/features/cart/cart-buttons";

export const isSoldOut = (p: StoreProduct) => p.stock_available < 1;

export function Price({ product, className }: { product: StoreProduct; className?: string }) {
  const { price, original, endsAt } = product.sale;
  // nowrap per amount: "Rp" must never end up on a different line than its number.
  if (!original) return <span className={`whitespace-nowrap ${className ?? ""}`}>{formatIDR(price)}</span>;
  return (
    <span className={className}>
      <span className="mr-1 text-[0.85em] whitespace-nowrap line-through opacity-60">{formatIDR(original)}</span>
      <span className="whitespace-nowrap">{formatIDR(price)}</span>
      {endsAt && <Countdown endsAt={endsAt} className="ml-2 text-[0.8em] font-semibold whitespace-nowrap text-red-500" />}
    </span>
  );
}

/** "Netflix + Spotify" line under a bundle's title. */
export function BundleContents({ product, className = "" }: { product: StoreProduct; className?: string }) {
  if (!product.bundle_titles) return null;
  return <p className={`text-xs opacity-70 ${className}`}>Paket: {product.bundle_titles.join(" + ")}</p>;
}

/**
 * The product name as a stretched link: its ::after covers the nearest `relative` card, so
 * the whole card opens the detail page. BuyButton is lifted above it with z-10.
 */
export function ProductLink({ product, className, children }: { product: StoreProduct; className?: string; children?: React.ReactNode }) {
  return (
    <Link href={product.detailHref} className={cn("after:absolute after:inset-0 after:z-[1] after:content-[''] focus-visible:underline focus-visible:outline-none", className)}>
      {children ?? product.title}
    </Link>
  );
}

/** A whole-card link layer for cards whose title sits inside another positioned box (Bento). */
export function CardLink({ product }: { product: StoreProduct }) {
  return <Link href={product.detailHref} aria-hidden tabIndex={-1} className="absolute inset-0 z-[1]" />;
}

/** "★ 4.8 (12)" — nothing until the product has a visible review. */
export function RatingBadge({ product, className = "" }: { product: StoreProduct; className?: string }) {
  const { avg, count } = ratingSummary(product.rating);
  if (!count) return null;
  return (
    <span className={cn("flex w-fit items-center gap-1 text-xs", className)} aria-label={`Rating ${avg} dari ${count} ulasan`}>
      <Star className="size-3.5 fill-amber-400 text-amber-400" />
      <b>{avg.toFixed(1)}</b>
      <span className="opacity-60">({count})</span>
    </span>
  );
}

export function BuyButton({
  product,
  className,
  children,
  wrapClassName,
  cartClassName,
}: {
  product: StoreProduct;
  className?: string;
  children?: React.ReactNode;
  /** Layout of the [cart icon][Beli] pair inside the card. */
  wrapClassName?: string;
  /** Extra classes for the cart icon (it otherwise copies the Beli button's look). */
  cartClassName?: string;
}) {
  if (isSoldOut(product)) {
    return (
      // Same size as the template's Beli button, in a solid neutral color (a faded accent was
      // hard to read and looked disabled).
      <span className={cn("relative z-[2] flex shrink-0", wrapClassName)}>
        <Link
          href={`${product.detailHref}#kabari`}
          className={`${className} border-neutral-300! bg-neutral-200! text-neutral-800! shadow-none!`}
          title="Stok habis — minta dikabari saat tersedia"
        >
          Kabari saya
        </Link>
      </span>
    );
  }
  return (
    <span className={cn("relative z-[2] flex shrink-0 items-stretch gap-1.5", wrapClassName)}>
      <AddToCart storeId={product.store_id} productId={product.id} compact className={cn(className, "mt-0! px-2.5!", cartClassName)} />
      <Link href={product.href} className={className}>
        {children ?? "Beli Langsung"}
      </Link>
    </span>
  );
}

export function EmptyCatalog({ className = "" }: { className?: string }) {
  return <p className={`py-20 text-center ${className}`}>Belum ada produk yang dijual.</p>;
}
