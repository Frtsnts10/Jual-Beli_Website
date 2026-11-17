"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { ProductImage } from "@/components/templates/product-image";
import { formatIDR } from "@/lib/utils";
import { MAX_LINES, MAX_QTY } from "@/lib/cart-math";
import { btnPrimary } from "@/lib/ui";
import { CheckoutForm, type CheckoutBuyer } from "@/features/checkout/checkout-form";
import { cart, useCart } from "./cart-store";

export interface CartProduct {
  id: string;
  title: string;
  image_url: string | null;
  duration_days: number;
  bundle_titles: string[] | null;
  stock: number;
  price: number;
  original: number | null;
  href: string;
}

export function CartView({
  storeId,
  storeKey,
  products,
  buyer,
  signInHref,
  shopHref,
  vouchers,
  canPay,
}: {
  storeId: string;
  storeKey: string;
  products: CartProduct[];
  buyer: CheckoutBuyer | null;
  signInHref: string;
  shopHref: string;
  vouchers: boolean;
  canPay: boolean;
}) {
  const items = useCart(storeId);
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  // Products taken off sale since they were added just disappear from the cart.
  useEffect(() => {
    for (const i of items) if (!byId.has(i.id)) cart.set(storeId, i.id, 0);
  }, [items, byId, storeId]);

  const rows = items.flatMap((i) => {
    const p = byId.get(i.id);
    return p ? [{ ...i, p }] : [];
  });
  const buyable = rows.filter((r) => r.p.stock > 0).map((r) => ({ id: r.id, qty: Math.min(r.qty, r.p.stock) }));
  const units = buyable.reduce((s, i) => s + i.qty, 0);
  const subtotal = buyable.reduce((s, i) => s + i.qty * byId.get(i.id)!.price, 0);
  const tooMany = units > MAX_LINES;

  if (rows.length === 0) {
    return (
      <div className="t-card grid justify-items-center gap-3 p-10 text-center">
        <ShoppingCart className="size-10 text-neutral-300" />
        <p className="text-neutral-600">Keranjang masih kosong.</p>
        <Link href={shopHref} className={btnPrimary}>
          Lihat produk
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_22rem] md:items-start">
      <ul className="t-card divide-y">
        {rows.map(({ id, qty, p }) => {
          const max = Math.min(MAX_QTY, p.stock);
          const soldOut = p.stock < 1;
          return (
            <li key={id} className="flex gap-3 p-4">
              <ProductImage src={p.image_url} alt={p.title} className="size-16 shrink-0 rounded-[var(--r-inner)] text-xl" />
              <div className="min-w-0 flex-1">
                <Link href={p.href} className="t-heading font-medium hover:underline">
                  {p.title}
                </Link>
                <p className="text-xs text-neutral-500">
                  {p.duration_days} hari
                  {p.bundle_titles && ` · ${p.bundle_titles.join(" + ")}`}
                </p>
                <p className="mt-1 text-sm font-semibold whitespace-nowrap">
                  {p.original && <span className="mr-1.5 text-xs font-normal text-neutral-400 line-through">{formatIDR(p.original)}</span>}
                  {formatIDR(p.price)}
                </p>
                {soldOut ? (
                  <p className="mt-1 text-xs font-medium text-red-600">Stok habis — tidak ikut dibayar</p>
                ) : (
                  qty > p.stock && <p className="mt-1 text-xs font-medium text-amber-700">Stok tinggal {p.stock}</p>
                )}
              </div>
              <div className="flex flex-col items-end justify-between gap-2">
                <button
                  type="button"
                  aria-label={`Hapus ${p.title}`}
                  onClick={() => cart.set(storeId, id, 0)}
                  className="rounded p-1 text-neutral-400 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </button>
                {!soldOut && (
                  <div className="t-btn-line flex items-center bg-white">
                    <button
                      type="button"
                      aria-label="Kurangi"
                      disabled={qty <= 1}
                      onClick={() => cart.set(storeId, id, qty - 1)}
                      className="grid size-8 place-items-center disabled:opacity-30"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm tabular-nums" aria-label="Jumlah">
                      {Math.min(qty, p.stock)}
                    </span>
                    <button
                      type="button"
                      aria-label="Tambah"
                      disabled={qty >= max}
                      onClick={() => cart.set(storeId, id, qty + 1)}
                      className="grid size-8 place-items-center disabled:opacity-30"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="t-card grid gap-4 p-5 md:sticky md:top-20">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-neutral-500">Subtotal ({units} item)</span>
          <span className="text-xl font-bold whitespace-nowrap">{formatIDR(subtotal)}</span>
        </div>
        <p className="-mt-2 text-xs text-neutral-500">Satu QRIS untuk semua. Tiap akun dikirim terpisah ke WhatsApp dan punya garansi sendiri.</p>
        {tooMany && (
          <p className="rounded-[var(--r-inner)] bg-amber-50 px-3 py-2 text-sm text-amber-800">Maksimal {MAX_LINES} item per pembayaran. Kurangi jumlahnya.</p>
        )}
        {canPay ? (
          <CheckoutForm
            storeKey={storeKey}
            items={buyable}
            clearCartOf={storeId}
            soldOut={units === 0 || tooMany}
            buyer={buyer}
            signInHref={signInHref}
            vouchers={vouchers}
          />
        ) : (
          <p className="text-sm text-neutral-600">Toko ini belum mengatur pembayaran QRIS. Hubungi penjual.</p>
        )}
      </div>
    </div>
  );
}
