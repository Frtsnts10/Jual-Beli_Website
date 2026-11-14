import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { TIERS } from "@/config/tiers";
import type { LayoutTemplate, Product, Store, SubscriptionTier } from "@/types/schema";

// Storefront reads only `stores` and published `products` (plan-storefront.md §6).
// It never touches credentials_vault or stores/{id}/private.

/** Paid plans past subscription_expiry act as Starter (same rule as the dashboard's mappers). */
function effectiveTier(tier: SubscriptionTier | undefined, expiry: unknown): SubscriptionTier {
  if (!tier || tier === "starter") return "starter";
  const end = iso(expiry);
  return end && new Date(end) < new Date() ? "starter" : tier;
}

function iso(v: unknown): string {
  if (v && typeof v === "object" && "toDate" in v) return (v as { toDate(): Date }).toDate().toISOString();
  return typeof v === "string" ? v : "";
}

export interface PublicStore extends Store {
  tier: SubscriptionTier;
  /** layout_template after enforcing the owner's plan (falls back to Hero Catalog). */
  template: LayoutTemplate;
}

/** Resolves the [storeSlug] segment, which is either a slug or a custom domain. */
export const getStore = cache(async (key: string): Promise<PublicStore | null> => {
  const decoded = decodeURIComponent(key).toLowerCase();
  const isDomain = decoded.includes(".");
  let index = await adminDb.collection(isDomain ? "store_domains" : "store_slugs").doc(decoded).get();
  // www.tokoku.com serves the same store as tokoku.com (Vercel also redirects www → apex).
  if (!index.exists && isDomain && decoded.startsWith("www.")) {
    index = await adminDb.collection("store_domains").doc(decoded.slice(4)).get();
  }
  if (!index.exists) return null;

  const snap = await adminDb.collection("stores").doc(index.get("store_id")).get();
  if (!snap.exists) return null;
  const d = snap.data()!;

  const owner = await adminDb.collection("users").doc(d.owner_uid).get();
  const tier = effectiveTier(owner.get("subscription_tier"), owner.get("subscription_expiry"));
  // A custom domain only works while the owner's plan includes it.
  if (isDomain && !TIERS[tier].customDomain) return null;

  const config = d.storefront_config ?? {};
  const wanted: LayoutTemplate = config.layout_template ?? "template_c_hero";
  return {
    id: snap.id,
    owner_uid: d.owner_uid,
    store_name: d.store_name ?? "",
    slug: d.slug,
    custom_domain: d.custom_domain ?? null,
    storefront_config: {
      layout_template: wanted,
      accent_color: config.accent_color ?? "#10B981",
      tagline: config.tagline ?? "",
      banner_url: config.banner_url ?? "",
      logo_url: config.logo_url ?? "",
    },
    is_active: d.is_active ?? true,
    created_at: iso(d.created_at),
    tier,
    template: TIERS[tier].templates.includes(wanted) ? wanted : "template_c_hero",
  };
});

/** A published product as the storefront sees it; bundles carry their contents. */
export type StoreProductData = Product & { bundle_titles: string[] | null };

function mapProduct(id: string, d: FirebaseFirestore.DocumentData): Product {
  return {
    id,
    store_id: d.store_id,
    title: d.title ?? "",
    description: d.description ?? "",
    image_url: d.image_url ?? null,
    platform_type: d.platform_type ?? "Other",
    price: d.price ?? 0,
    duration_days: d.duration_days ?? 30,
    bundle_items: d.bundle_items ?? null,
    is_flash_sale: d.is_flash_sale ?? false,
    flash_sale_price: d.flash_sale_price ?? null,
    flash_sale_ends_at: iso(d.flash_sale_ends_at) || null,
    is_published: d.is_published ?? false,
    stock_available: d.stock_available ?? 0,
    created_at: iso(d.created_at),
    updated_at: iso(d.updated_at),
  };
}

/**
 * Bundles have no stock of their own: available = the scarcest component's
 * stock_available. Components may be unpublished (sold only inside the bundle).
 */
async function resolveBundles(products: Product[]): Promise<StoreProductData[]> {
  const ids = [...new Set(products.flatMap((p) => p.bundle_items ?? []))];
  const parts = ids.length ? await adminDb.getAll(...ids.map((id) => adminDb.collection("products").doc(id))) : [];
  const byId = new Map(parts.filter((s) => s.exists).map((s) => [s.id, mapProduct(s.id, s.data()!)]));
  return products.map((p) => {
    if (!p.bundle_items?.length) return { ...p, bundle_titles: null };
    const comps = p.bundle_items.map((id) => byId.get(id));
    const complete = comps.every((c) => c && c.store_id === p.store_id);
    return {
      ...p,
      stock_available: complete ? Math.min(...comps.map((c) => c!.stock_available)) : 0,
      bundle_titles: comps.map((c) => c?.title ?? "?"),
    };
  });
}

export const getPublishedProducts = cache(async (storeId: string): Promise<StoreProductData[]> => {
  const snap = await adminDb
    .collection("products")
    .where("store_id", "==", storeId)
    .where("is_published", "==", true)
    .get();
  return (await resolveBundles(snap.docs.map((doc) => mapProduct(doc.id, doc.data()))))
    .sort((a, b) => Number(b.is_flash_sale) - Number(a.is_flash_sale) || a.price - b.price);
});

export const getPublishedProduct = cache(async (storeId: string, productId: string): Promise<StoreProductData | null> => {
  if (!/^[A-Za-z0-9]{1,64}$/.test(productId)) return null;
  const snap = await adminDb.collection("products").doc(productId).get();
  if (!snap.exists) return null;
  const product = mapProduct(snap.id, snap.data()!);
  if (product.store_id !== storeId || !product.is_published) return null;
  return (await resolveBundles([product]))[0];
});

/**
 * Builds an in-store link. On a subdomain/custom domain the slug is implicit
 * (`/checkout/x`); with path-based routing it is the first segment (`/toko/checkout/x`).
 */
export async function storeLinker(slugOrKey: string) {
  const viaHost = (await headers()).get("x-store-routing") === "host";
  const base = viaHost ? "" : `/${slugOrKey}`;
  return (path = "") => `${base}${path}` || "/";
}
