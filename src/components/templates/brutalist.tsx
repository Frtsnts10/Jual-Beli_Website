import { Lift, Reveal } from "@/components/motion";
import { BundleContents, BuyButton, EmptyCatalog, Price, ProductLink, RatingBadge } from "./shared";
import { ProductImage } from "./product-image";
import type { TemplateProps } from "./types";

// Template E — Gumroad-style neo-brutalism: thick borders, solid shadows, loud colours.
const CARD_BG = ["bg-[#ffc900]", "bg-[#ff90e8]", "bg-[#90a8ed]", "bg-[#23a094]", "bg-[#f1f333]"];

export function BrutalistTemplate({ store, products }: TemplateProps) {
  return (
    <div className="flex-1 bg-[#f4f4f0] font-mono text-black">
      <header className="border-b-4 border-black bg-[var(--accent)] text-[var(--accent-fg)]">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h1 className="text-4xl font-black tracking-tighter uppercase [overflow-wrap:anywhere] sm:text-5xl md:text-7xl">{store.store_name}</h1>
          {store.storefront_config.tagline && (
            <p className="mt-4 inline-block border-2 border-black bg-white px-3 py-1 text-black shadow-[4px_4px_0_#000]">{store.storefront_config.tagline}</p>
          )}
        </div>
      </header>
      <main id="produk" className="mx-auto grid max-w-6xl scroll-mt-20 gap-6 px-6 py-12 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
        {products.length === 0 && <EmptyCatalog className="col-span-full" />}
        {products.map((p, i) => (
          <Reveal key={p.id} index={i}>
            <Lift className={`relative flex h-full flex-col border-4 border-black shadow-[8px_8px_0_#000] ${CARD_BG[i % CARD_BG.length]}`}>
              <ProductImage src={p.image_url} alt={p.title} className="aspect-video w-full border-b-4 border-black" />
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="border-2 border-black bg-white px-2 text-xs font-bold uppercase">{p.platform_type}</span>
                  {p.is_flash_sale && <span className="rotate-3 bg-black px-2 text-xs font-bold text-white">SALE!</span>}
                </div>
                <h2 className="text-xl leading-tight font-black">
                  <ProductLink product={p} />
                </h2>
                <RatingBadge product={p} className="font-bold" />
                <BundleContents product={p} />
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <Price product={p} className="border-2 border-black bg-white px-2 py-1 text-lg font-black" />
                  <BuyButton
                    product={p}
                    className="ml-auto border-2 border-black bg-black px-4 py-2 text-sm font-bold text-white shadow-[4px_4px_0_#fff] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  >
                    BELI →
                  </BuyButton>
                </div>
              </div>
            </Lift>
          </Reveal>
        ))}
      </main>
    </div>
  );
}
