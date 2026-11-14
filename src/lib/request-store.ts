import "server-only";
import { headers } from "next/headers";
import { cleanHost, storeKeyForHost } from "@/lib/host";
import { getStore, type PublicStore } from "@/lib/stores";

/**
 * For routes the proxy doesn't rewrite (sitemap.xml, robots.txt): the request's origin and,
 * when the host is a store's domain/subdomain, that store.
 */
export async function requestStore(): Promise<{ origin: string; store: PublicStore | null }> {
  const h = await headers();
  const host = cleanHost(h.get("host"));
  const proto = h.get("x-forwarded-proto") ?? (host === "localhost" ? "http" : "https");
  const key = storeKeyForHost(host);
  return { origin: `${proto}://${h.get("host")}`, store: key ? await getStore(key) : null };
}
