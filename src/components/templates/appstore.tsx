import { Lift } from "@/components/motion";
import { BundleContents, BuyButton, EmptyCatalog, Price, ProductLink, RatingBadge } from "./shared";
import { ProductImage, StoreLogo } from "./product-image";
import type { StoreProduct, TemplateProps } from "./types";

// Template D — App Store / Netflix style: one horizontally scrolling shelf per category.
export function AppStoreTemplate({ store, products }: TemplateProps) {
  const shelves = new Map<string, StoreProduct[]>();
  for (const p of products) shelves.set(p.platform_type, [...(shelves.get(p.platform_type) ?? []), p]);
  const flash = products.filter((p) => p.is_flash_sale);

  return (
    <div className="min-h-[calc(100svh-3.5rem)] bg-white text-neutral-900">
      <header className="mx-auto flex max-w-6xl items-center gap-3 px-6 pt-10 pb-6">
        <StoreLogo src={store.storefront_config.logo_url} name={store.store_name} className="size-10" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{store.store_name}</h1>
          {store.storefront_config.tagline && <p className="text-sm text-neutral-500">{store.storefront_config.tagline}</p>}
        </div>
      </header>
      <div id="produk" className="scroll-mt-20" />
      {products.length === 0 && <EmptyCatalog className="text-neutral-500" />}
      {flash.length > 0 && <Shelf title="🔥 Flash sale" items={flash} featured />}
      {[...shelves].map(([category, items]) => (
        <Shelf key={category} title={category} items={items} />
      ))}
    </div>
  );
}

function Shelf({ title, items, featured }: { title: string; items: StoreProduct[]; featured?: boolean }) {
  return (
    <section className="mx-auto max-w-6xl py-4">
      <h2 className="mb-3 px-6 text-lg font-semibold">{title}</h2>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none]">
        {items.map((p) => (
          <Lift key={p.id} className={`relative shrink-0 snap-start ${featured ? "w-72" : "w-44"}`}>
            <div className="overflow-hidden rounded-2xl bg-neutral-100">
              <ProductImage src={p.image_url} alt={p.title} className={featured ? "aspect-video w-full" : "aspect-square w-full"} />
            </div>
            <h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-medium">
              <ProductLink product={p} />
            </h3>
            <RatingBadge product={p} />
            <BundleContents product={p} className="line-clamp-1" />
            <div className="mt-1 flex items-center justify-between gap-2">
              <Price product={p} className="text-xs text-neutral-500" />
              <BuyButton product={p} className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-[var(--accent)] uppercase">
                Beli
              </BuyButton>
            </div>
          </Lift>
        ))}
      </div>
    </section>
  );
}
