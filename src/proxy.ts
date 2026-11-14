import { NextResponse, type NextRequest } from "next/server";
import { cleanHost, storeKeyForHost } from "@/lib/host";

// Multi-tenant routing (plan-storefront.md §7).
//
//   toko.<ROOT_DOMAIN>/…   → rewritten to /toko/…            (subdomain)
//   namatoko.com/…         → rewritten to /namatoko.com/…    (custom domain)
//   <ROOT_DOMAIN>/toko/…   → served as-is                    (path-based; also localhost
//                                                             and *.vercel.app)
//
// Custom domains work even without NEXT_PUBLIC_ROOT_DOMAIN: until the platform has its own
// domain it lives on *.vercel.app and every other host is a store's domain.
//
// The [storeSlug] segment therefore holds either a slug or a custom domain; see
// lib/stores.ts. A rewritten request carries x-store-routing: host so pages know to
// build links without the slug prefix.

const REF_RE = /^[a-zA-Z0-9_-]{2,32}$/;

export function proxy(request: NextRequest) {
  const host = cleanHost(request.headers.get("host"));
  const key = storeKeyForHost(host);
  const { pathname, searchParams } = request.nextUrl;

  let response: NextResponse;
  if (key) {
    const url = request.nextUrl.clone();
    url.pathname = `/${key}${pathname === "/" ? "" : pathname}`;
    const headers = new Headers(request.headers);
    headers.set("x-store-routing", "host");
    response = NextResponse.rewrite(url, { request: { headers } });
  } else {
    response = NextResponse.next();
  }

  // Affiliate receiver: remember ?ref=username for 30 days; checkout copies it onto the order.
  const ref = searchParams.get("ref");
  if (ref && REF_RE.test(ref)) {
    response.cookies.set("ref", ref, { maxAge: 60 * 60 * 24 * 30, path: "/", sameSite: "lax", httpOnly: true });
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|\\.well-known|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
