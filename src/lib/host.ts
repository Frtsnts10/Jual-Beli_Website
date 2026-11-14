// Which store a request's host belongs to. Shared by the proxy (rewrites) and the
// host-aware routes that the proxy doesn't rewrite (sitemap.xml, robots.txt).
//
//   toko.<ROOT_DOMAIN>    → "toko"            (subdomain)
//   namatoko.com          → "namatoko.com"    (custom domain)
//   <ROOT_DOMAIN>, localhost, IPs, *.vercel.app → null (the platform itself, path-based)

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.toLowerCase();

export const cleanHost = (raw: string | null | undefined) => (raw ?? "").toLowerCase().replace(/:\d+$/, "");

export function storeKeyForHost(host: string): string | null {
  // The platform's own hosts — dev, IPs and *.vercel.app — use path-based routing.
  if (!host || host === "localhost" || /^[\d.]+$/.test(host) || host.endsWith(".vercel.app")) return null;
  if (ROOT_DOMAIN) {
    if (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`) return null;
    if (host.endsWith(`.${ROOT_DOMAIN}`)) return host.slice(0, -(ROOT_DOMAIN.length + 1));
  }
  // Any other host pointed at this deployment is a store's custom domain — with or without
  // a platform root domain. (Unknown domains get the "store not found" page, not the landing.)
  return host;
}
