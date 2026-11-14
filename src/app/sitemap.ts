import type { MetadataRoute } from "next";
import { getPublishedProducts } from "@/lib/stores";
import { requestStore } from "@/lib/request-store";

// Host-aware: on a store's own domain this lists that store's pages; on the platform host,
// just the landing page (stores on *.vercel.app paths are reached through their own domains).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { origin, store } = await requestStore();
  if (!store || !store.is_active) return [{ url: `${origin}/`, changeFrequency: "weekly", priority: 1 }];

  const products = await getPublishedProducts(store.id);
  const lastModified = products.reduce((latest, p) => (p.updated_at > latest ? p.updated_at : latest), store.created_at) || undefined;
  const info = store.store_info;
  return [
    { url: `${origin}/`, lastModified, changeFrequency: "daily", priority: 1 },
    ...products.map((p) => ({ url: `${origin}/checkout/${p.id}`, lastModified: p.updated_at || undefined, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...(info.about ? [{ url: `${origin}/tentang`, priority: 0.4 }] : []),
    ...(info.faq.length ? [{ url: `${origin}/faq`, priority: 0.4 }] : []),
    ...(info.warranty_policy ? [{ url: `${origin}/garansi`, priority: 0.4 }] : []),
    { url: `${origin}/track`, priority: 0.3 },
  ];
}
