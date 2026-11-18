/* eslint-disable @next/next/no-img-element -- seller-supplied banner URL */
import { Lift, Reveal } from "@/components/motion";
import { BundleContents, BuyButton, EmptyCatalog, Price, ProductLink, RatingBadge } from "./shared";
import { ProductImage, StoreLogo } from "./product-image";
import type { TemplateProps } from "./types";

// Template C — classic e-commerce: big hero banner, tidy card grid below.
export function HeroTemplate({ store, products }: TemplateProps) {
  const { banner_url, tagline, logo_url } = store.storefront_config;
  return (
    <div className="min-h-[calc(100svh-3.5rem)] bg-neutral-50 text-neutral-900">
      <section className="relative isolate overflow-hidden bg-[var(--accent)] text-[var(--accent-fg)]">
        {banner_url && <img src={banner_url} alt="" className="absolute inset-0 -z-10 size-full object-cover opacity-40" />}
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <StoreLogo src={logo_url} name={store.store_name} className="mb-6 size-14" />
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-6xl">{store.store_name}</h1>
          {tagline && <p className="mt-4 max-w-xl text-lg opacity-90">{tagline}</p>}
          <a href="#produk" className="mt-8 inline-block rounded-[var(--r-btn)] bg-white px-5 py-3 text-sm font-semibold text-neutral-900 shadow">
            Lihat produk
          </a>
        </div>
      </section>
      <main id="produk" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-14">
        <h2 className="mb-6 text-xl font-semibold">Semua produk</h2>
        {products.length === 0 && <EmptyCatalog className="text-neutral-500" />}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal key={p.id} index={i}>
              <Lift className="relative flex h-full flex-col overflow-hidden rounded-[var(--r-card)] border bg-white shadow-sm">
                <div className="relative">
                  <ProductImage src={p.image_url} alt={p.title} className="aspect-[4/3] w-full" />
                  {p.is_flash_sale && <span className="absolute top-2 left-2 rounded bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">FLASH SALE</span>}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <span className="text-xs text-neutral-500">{p.platform_type}</span>
                  <h3 className="line-clamp-2 font-medium">
                    <ProductLink product={p} />
                  </h3>
                  <RatingBadge product={p} />
                  <BundleContents product={p} />
                  <Price product={p} className="mt-auto flex flex-wrap items-baseline gap-x-1 pt-2 font-semibold" />
                  <BuyButton
                    product={p}
                    wrapClassName="mt-2"
                    className="flex-1 rounded-[var(--r-btn)] bg-[var(--accent)] py-2 text-center text-sm font-medium text-[var(--accent-fg)]"
                    cartClassName="flex-none"
                  >
                    Beli
                  </BuyButton>
                </div>
              </Lift>
            </Reveal>
          ))}
        </div>
      </main>
    </div>
  );
}
