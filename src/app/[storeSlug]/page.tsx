import { notFound } from "next/navigation";
import { getPublishedProducts, getStore, storeLinker } from "@/lib/stores";
import { TEMPLATE_COMPONENTS } from "@/components/templates";
import { priceFor } from "@/lib/pricing";

export default async function StorefrontPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params;
  const store = await getStore(storeSlug);
  if (!store) notFound();

  const [products, link] = await Promise.all([getPublishedProducts(store.id), storeLinker(storeSlug)]);
  const Template = TEMPLATE_COMPONENTS[store.template];
  return (
    <Template
      store={store}
      products={products.map((p) => ({ ...p, href: link(`/checkout/${p.id}`), sale: priceFor(p, store.tier) }))}
    />
  );
}
