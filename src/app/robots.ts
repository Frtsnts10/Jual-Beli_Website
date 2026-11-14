import type { MetadataRoute } from "next";
import { requestStore } from "@/lib/request-store";

// One robots.txt per host: each store domain points crawlers at its own sitemap.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const { origin } = await requestStore();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/*/checkout/success", "/checkout/success"] },
    sitemap: `${origin}/sitemap.xml`,
  };
}
