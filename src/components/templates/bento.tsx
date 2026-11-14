import { Sparkles } from "lucide-react";
import { Lift, Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";
import { BundleContents, BuyButton, EmptyCatalog, Price, isSoldOut } from "./shared";
import { ProductImage, StoreLogo } from "./product-image";
import type { TemplateProps } from "./types";

// Template A — asymmetric bento grid, rounded and premium.
const SPANS = ["md:col-span-2 md:row-span-2", "md:col-span-2", "", "", "md:col-span-2", "", "md:row-span-2", ""];

export function BentoTemplate({ store, products }: TemplateProps) {
  return (
    <div className="min-h-[calc(100svh-3.5rem)] bg-neutral-100 text-neutral-900">
      <header className="mx-auto flex max-w-6xl items-center gap-4 px-6 pt-12 pb-8">
        <StoreLogo src={store.storefront_config.logo_url} name={store.store_name} className="size-12" />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{store.store_name}</h1>
          {store.storefront_config.tagline && <p className="mt-1 text-neutral-500">{store.storefront_config.tagline}</p>}
        </div>
      </header>
      <main id="produk" className="mx-auto grid max-w-6xl scroll-mt-20 auto-rows-[200px] grid-cols-1 gap-4 px-6 pb-12 md:grid-cols-4">
        {products.length === 0 && <EmptyCatalog className="col-span-full text-neutral-500" />}
        {products.map((p, i) => {
          const big = i % SPANS.length === 0;
          return (
            <Reveal key={p.id} index={i} className={cn(SPANS[i % SPANS.length])}>
              <Lift className="group relative h-full overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
                {/* Without an image the initial sits top-right, clear of the title at the bottom. */}
                <ProductImage
                  src={p.image_url}
                  alt={p.title}
                  className="absolute inset-0 size-full items-start justify-end p-5 text-5xl opacity-90 transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
                  <div className="min-w-0">
                    {p.is_flash_sale && (
                      <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs backdrop-blur">
                        <Sparkles className="size-3" /> Flash sale
                      </span>
                    )}
                    <h2 className={cn("font-semibold", big ? "text-2xl" : "text-base")}>{p.title}</h2>
                    <BundleContents product={p} />
                    <Price product={p} className="text-sm text-white/80" />
                  </div>
                  <BuyButton
                    product={p}
                    className={cn(
                      "shrink-0 rounded-full px-4 py-2 text-sm font-medium",
                      isSoldOut(p) ? "bg-white/30" : "bg-[var(--accent)] text-[var(--accent-fg)]"
                    )}
                  >
                    Beli
                  </BuyButton>
                </div>
              </Lift>
            </Reveal>
          );
        })}
      </main>
    </div>
  );
}
