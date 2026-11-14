"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { BuyButton, EmptyCatalog, Price, StoreFooter } from "./shared";
import type { TemplateProps } from "./types";

// Template B — Notion-like rows, no big images; built for catalogues with hundreds of items.
export function ListTemplate({ store, products, trackHref }: TemplateProps) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? products.filter((p) => `${p.title} ${p.platform_type}`.toLowerCase().includes(q)) : products;
  }, [products, query]);

  return (
    <div className="min-h-svh bg-white text-neutral-900">
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
        <ul className="mt-4 divide-y divide-neutral-100">
          {products.length === 0 && <EmptyCatalog className="text-neutral-500" />}
          {products.length > 0 && visible.length === 0 && <li className="py-10 text-center text-sm text-neutral-500">Tidak ada hasil.</li>}
          {visible.map((p) => (
            <li key={p.id} className="flex items-center gap-4 py-3">
              <span className="w-24 shrink-0 rounded bg-neutral-100 px-2 py-0.5 text-center text-xs text-neutral-600">{p.platform_type}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {p.title}
                  {p.is_flash_sale && <span className="ml-2 text-xs text-[var(--accent)]">● flash sale</span>}
                </div>
                <div className="text-xs text-neutral-400">{p.bundle_titles ? `Paket: ${p.bundle_titles.join(" + ")}` : `${p.duration_days} hari`}</div>
              </div>
              <Price product={p} className="text-right text-sm tabular-nums" />
              <BuyButton product={p} className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)]">
                Beli
              </BuyButton>
            </li>
          ))}
        </ul>
      </div>
      <StoreFooter storeName={store.store_name} trackHref={trackHref} className="max-w-3xl text-neutral-500" />
    </div>
  );
}
