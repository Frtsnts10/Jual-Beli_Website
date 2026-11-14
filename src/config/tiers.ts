import type { LayoutTemplate, SubscriptionTier } from "@/types/schema";

export const TEMPLATES: { id: LayoutTemplate; name: string; description: string }[] = [
  { id: "template_a_bento", name: "Bento Grid", description: "Asimetris & premium, untuk produk sedikit tapi eksklusif." },
  { id: "template_b_list", name: "List Minimalist", description: "Daftar baris ringkas, cocok untuk ratusan produk." },
  { id: "template_c_hero", name: "Hero Catalog", description: "Banner besar + grid kartu produk klasik." },
  { id: "template_d_appstore", name: "App Store Hub", description: "Baris horizontal per kategori, enak di-scroll." },
  { id: "template_e_brutalist", name: "Neo-Brutalist", description: "Border tebal, shadow solid, warna mencolok." },
];

export interface TierConfig {
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxStores: number;
  maxCredentials: number;
  templates: LayoutTemplate[];
  feePercent: number;
  autoFulfillment: boolean;
  customDomain: boolean;
  marketing: boolean;
  multiAdmin: boolean;
}

const ALL_TEMPLATES = TEMPLATES.map((t) => t.id);

export const TIERS: Record<SubscriptionTier, TierConfig> = {
  starter: {
    name: "Starter",
    priceMonthly: 0,
    priceYearly: 0,
    maxStores: 1,
    maxCredentials: 50,
    templates: ["template_b_list", "template_c_hero"],
    feePercent: 5,
    autoFulfillment: false,
    customDomain: false,
    marketing: false,
    multiAdmin: false,
  },
  pro: {
    name: "Pro",
    priceMonthly: 99_000,
    priceYearly: 990_000,
    maxStores: 3,
    maxCredentials: Infinity,
    templates: ALL_TEMPLATES,
    feePercent: 3,
    autoFulfillment: true,
    customDomain: false,
    marketing: false,
    multiAdmin: false,
  },
  ultimate: {
    name: "Ultimate",
    priceMonthly: 249_000,
    priceYearly: 2_490_000,
    maxStores: Infinity,
    maxCredentials: Infinity,
    templates: ALL_TEMPLATES,
    feePercent: 1,
    autoFulfillment: true,
    customDomain: true,
    marketing: true,
    multiAdmin: true,
  },
};

export const PLATFORM_TYPES = ["Media", "AI", "VPN", "Music", "Productivity", "Other"] as const;

export const DEFAULT_WA_TEMPLATE =
  "Halo! Terima kasih sudah order {product} di {store}.\n\nEmail: {email}\nPassword: {password}\nPIN: {pin}\nAktif s/d: {expiry}\n\nOrder ID: {order_id}";
