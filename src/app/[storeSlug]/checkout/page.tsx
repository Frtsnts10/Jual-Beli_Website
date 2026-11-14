import { notFound, redirect } from "next/navigation";
import { getPublishedProduct, getStore, storeLinker } from "@/lib/stores";

// Deep-link checkout for WA catalogue bots: /checkout?item=<productId>
export default async function DeepLinkCheckout({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ item?: string }>;
}) {
  const { storeSlug } = await params;
  const { item } = await searchParams;
  const store = await getStore(storeSlug);
  if (!store || !item) notFound();
  const product = await getPublishedProduct(store.id, item);
  if (!product) notFound();
  redirect((await storeLinker(storeSlug))(`/checkout/${product.id}`));
}
