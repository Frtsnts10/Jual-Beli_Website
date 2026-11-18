// What sellers get — plans, features and storefront themes — as configured by platform admins
// (platform/catalog), on top of the built-in defaults in config/tiers.ts. Pure: no Firestore,
// so the same rules run on the server, in the admin forms and in tests.
// Identical copy in the dashboard repo (src/lib/catalog-core.ts); keep both in sync.

import { TEMPLATES, TIERS, type TierConfig } from "@/config/tiers";
import type { LayoutTemplate, SubscriptionTier } from "@/types/schema";

export const PLAN_KEYS: SubscriptionTier[] = ["starter", "pro", "ultimate"];

export const FEATURE_KEYS = ["autoFulfillment", "vouchers", "marketing", "customDomain", "multiAdmin"] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];

export const FEATURE_INFO: Record<FeatureKey, { label: string; description: string }> = {
  autoFulfillment: { label: "Kirim otomatis via WhatsApp", description: "Akun, pengingat H-3, kabar restock dan notifikasi pembayaran lewat n8n." },
  vouchers: { label: "Voucher", description: "Kode diskon di checkout." },
  marketing: { label: "Marketing", description: "Flash sale, bundling, broadcast WhatsApp, bot Telegram/Discord." },
  customDomain: { label: "Domain sendiri", description: "Etalase di domain milik seller." },
  multiAdmin: { label: "Tim (multi-admin)", description: "Mengundang admin lain untuk mengelola toko." },
};

export const RADIUS = { none: "0", sm: "0.25rem", md: "0.5rem", lg: "0.75rem", xl: "1rem" } as const;
export type RadiusKey = keyof typeof RADIUS;
export const FONTS = { sans: "Sans", serif: "Serif", mono: "Mono" } as const;
export type FontKey = keyof typeof FONTS;

/** null = the template's built-in look. */
export interface TemplateStyle {
  radius: RadiusKey | null;
  font: FontKey | null;
  /** Accent for stores that haven't picked their own colour. */
  accent: string | null;
}

export interface TemplateInfo {
  id: LayoutTemplate;
  name: string;
  description: string;
  enabled: boolean;
  style: TemplateStyle;
}

export interface Catalog {
  plans: Record<SubscriptionTier, TierConfig>;
  templates: TemplateInfo[];
}

/** users/{uid}.feature_overrides — what an admin granted or removed for one seller. */
export interface FeatureOverrides {
  /** true = on, false = off, missing = as the plan says. */
  features?: Partial<Record<FeatureKey, boolean>>;
  /** Extra templates on top of the plan's. */
  templates?: LayoutTemplate[];
  /** null = unlimited; missing = as the plan says. */
  maxStores?: number | null;
  maxCredentials?: number | null;
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const isTemplate = (t: unknown): t is LayoutTemplate => TEMPLATES.some((x) => x.id === t);
/** Firestore can't store Infinity: unlimited is saved as null. */
const limit = (v: unknown, fallback: number) => (v === null ? Infinity : typeof v === "number" && v >= 0 ? Math.floor(v) : fallback);
const text = (v: unknown, fallback: string, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : fallback);

/** The stored catalog document (anything missing or invalid falls back to the defaults). */
export function mergeCatalog(raw: Record<string, unknown> | undefined | null): Catalog {
  const rawPlans = (raw?.plans ?? {}) as Record<string, Record<string, unknown>>;
  const rawTemplates = (raw?.templates ?? {}) as Record<string, Record<string, unknown>>;
  const plans = {} as Record<SubscriptionTier, TierConfig>;
  for (const key of PLAN_KEYS) {
    const d = TIERS[key];
    const r = rawPlans[key] ?? {};
    plans[key] = {
      name: text(r.name, d.name, 30),
      priceMonthly: typeof r.priceMonthly === "number" && r.priceMonthly >= 0 ? Math.round(r.priceMonthly) : d.priceMonthly,
      priceYearly: typeof r.priceYearly === "number" && r.priceYearly >= 0 ? Math.round(r.priceYearly) : d.priceYearly,
      maxStores: limit(r.maxStores, d.maxStores),
      maxCredentials: limit(r.maxCredentials, d.maxCredentials),
      templates: Array.isArray(r.templates) ? (r.templates.filter(isTemplate) as LayoutTemplate[]) : d.templates,
      ...(Object.fromEntries(FEATURE_KEYS.map((f) => [f, typeof r[f] === "boolean" ? r[f] : d[f]])) as Record<FeatureKey, boolean>),
    };
  }
  const templates = TEMPLATES.map((t): TemplateInfo => {
    const r = rawTemplates[t.id] ?? {};
    const s = (r.style ?? {}) as Record<string, unknown>;
    return {
      id: t.id,
      name: text(r.name, t.name, 40),
      description: text(r.description, t.description, 160),
      enabled: r.enabled !== false,
      style: {
        radius: typeof s.radius === "string" && s.radius in RADIUS ? (s.radius as RadiusKey) : null,
        font: typeof s.font === "string" && s.font in FONTS ? (s.font as FontKey) : null,
        accent: typeof s.accent === "string" && HEX.test(s.accent) ? s.accent : null,
      },
    };
  });
  // A template switched off everywhere would leave stores with nothing: keep at least one.
  if (!templates.some((t) => t.enabled)) templates[0].enabled = true;
  return { plans, templates };
}

export function cleanOverrides(raw: unknown): FeatureOverrides {
  const r = (raw ?? {}) as Record<string, unknown>;
  const f = (r.features ?? {}) as Record<string, unknown>;
  const out: FeatureOverrides = {};
  const features = Object.fromEntries(FEATURE_KEYS.filter((k) => typeof f[k] === "boolean").map((k) => [k, f[k] as boolean]));
  if (Object.keys(features).length) out.features = features;
  if (Array.isArray(r.templates)) {
    const t = r.templates.filter(isTemplate) as LayoutTemplate[];
    if (t.length) out.templates = t;
  }
  if ("maxStores" in r && (r.maxStores === null || typeof r.maxStores === "number")) out.maxStores = r.maxStores as number | null;
  if ("maxCredentials" in r && (r.maxCredentials === null || typeof r.maxCredentials === "number")) out.maxCredentials = r.maxCredentials as number | null;
  return out;
}

/**
 * What one seller actually gets: their plan, adjusted by their personal overrides, limited to
 * templates the platform has switched on.
 */
export function resolveFeatures(catalog: Catalog, tier: SubscriptionTier, overrides?: FeatureOverrides | null): TierConfig {
  const plan = catalog.plans[tier] ?? catalog.plans.starter;
  const o = overrides ?? {};
  const enabled = new Set(catalog.templates.filter((t) => t.enabled).map((t) => t.id));
  const templates = [...new Set([...plan.templates, ...(o.templates ?? [])])].filter((t) => enabled.has(t));
  return {
    ...plan,
    ...(Object.fromEntries(FEATURE_KEYS.map((k) => [k, o.features?.[k] ?? plan[k]])) as Record<FeatureKey, boolean>),
    maxStores: o.maxStores === undefined ? plan.maxStores : o.maxStores === null ? Infinity : o.maxStores,
    maxCredentials: o.maxCredentials === undefined ? plan.maxCredentials : o.maxCredentials === null ? Infinity : o.maxCredentials,
    // Never empty: fall back to the first switched-on template.
    templates: templates.length ? templates : [catalog.templates.find((t) => t.enabled)!.id],
  };
}

/** The template a store renders with: its choice if allowed, else the first allowed one. */
export function templateFor(wanted: LayoutTemplate, features: TierConfig): LayoutTemplate {
  return features.templates.includes(wanted) ? wanted : features.templates[0];
}

/** The plan's contents as short lines for plan cards ("3 toko", "Voucher", …). */
export function planPerks(t: TierConfig): string[] {
  const n = (v: number, unit: string, unlimited: string) => (Number.isFinite(v) ? `${v} ${unit}` : unlimited);
  return [
    n(t.maxStores, "toko", "Toko tanpa batas"),
    n(t.maxCredentials, "stok tersedia", "Stok tanpa batas"),
    `${t.templates.length} template etalase`,
    ...FEATURE_KEYS.filter((k) => t[k]).map((k) => FEATURE_INFO[k].label),
    ...(t.autoFulfillment ? [] : ["Kirim akun manual via WA"]),
    "Tanpa fee transaksi",
  ];
}
