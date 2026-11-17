import { notFound } from "next/navigation";
import { getPublishedProducts, getStore, storeLinker } from "@/lib/stores";
import { TEMPLATE_COMPONENTS } from "@/components/templates";
import { priceFor } from "@/lib/pricing";
import { HeroBanner } from "@/components/hero-banner";

export default async function StorefrontPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params;
  const store = await getStore(storeSlug);
  if (!store) notFound();

  const [products, link] = await Promise.all([getPublishedProducts(store.id), storeLinker(storeSlug)]);
  const Template = TEMPLATE_COMPONENTS[store.template];
  // Banner buttons point at a product of this store or an external https link.
  const ids = new Set(products.map((p) => p.id));
  const slides = store.hero_slides.map((h) => ({
    ...h,
    href: ids.has(h.cta_target) ? link(`/p/${h.cta_target}`) : /^https:\/\//.test(h.cta_target) ? h.cta_target : null,
  }));
  return (
    <>
      <HeroBanner slides={slides} />
      <Template
        store={store}
        products={products.map((p) => ({ ...p, href: link(`/checkout/${p.id}`), detailHref: link(`/p/${p.id}`), sale: priceFor(p, store.tier) }))}
      />
    </>
  );
}
