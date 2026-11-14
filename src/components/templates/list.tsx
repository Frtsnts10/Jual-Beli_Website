"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { BuyButton, EmptyCatalog, Price, ProductLink, RatingBadge } from "./shared";
import type { TemplateProps } from "./types";

// Template B — Notion-like rows, no big images; built for catalogues with hundreds of items.
export function ListTemplate({ store, products }: TemplateProps) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? products.filter((p) => `${p.title} ${p.platform_type}`.toLowerCase().includes(q)) : products;
  }, [products, query]);

  return (
    <div className="min-h-[calc(100svh-3.5rem)] bg-white text-neutral-900">
      <div className="mx-auto max-w-3xl px-6 pt-16">
        <h1 className="text-3xl font-bold tracking-tight">{store.store_name}</h1>
        {store.storefront_config.tagline && <p className="mt-2 text-neutral-500">{store.storefront_config.tagline}</p>}
        <label className="mt-8 flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 focus-within:border-neutral-400">
          <Search className="size-4 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Cari di ${products.length} produk…`}
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <ul id="produk" className="mt-4 scroll-mt-20 divide-y divide-neutral-100 pb-12">
          {products.length === 0 && <EmptyCatalog className="text-neutral-500" />}
          {products.length > 0 && visible.length === 0 && <li className="py-10 text-center text-sm text-neutral-500">Tidak ada hasil.</li>}
          {visible.map((p) => (
            <li key={p.id} className="relative flex items-center gap-3 py-3 sm:gap-4">
              <span className="hidden w-24 shrink-0 rounded bg-neutral-100 px-2 py-0.5 text-center text-xs text-neutral-600 sm:block">{p.platform_type}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  <ProductLink product={p} />
                  {p.is_flash_sale && <span className="ml-2 text-xs text-[var(--accent)]">● flash sale</span>}
                </div>
                <div className="truncate text-xs text-neutral-400">
                  <span className="sm:hidden">{p.platform_type} · </span>
                  {p.bundle_titles ? `Paket: ${p.bundle_titles.join(" + ")}` : `${p.duration_days} hari`}
                </div>
                <RatingBadge product={p} />
                {/* Phone: the price (and flash-sale timer) goes under the name so the row never overflows. */}
                <Price product={p} className="mt-1 block text-sm tabular-nums sm:hidden" />
              </div>
              <Price product={p} className="hidden shrink-0 text-right text-sm tabular-nums sm:block" />
              <BuyButton product={p} className="shrink-0 rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)]">
                Beli
              </BuyButton>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
