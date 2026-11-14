// Firestore data model — see plan-dashboard.md §5. Copied from the dashboard
// repo (Shop-Dashboard/src/types/schema.ts); keep both in sync.
//
// Timestamps are stored as Firestore Timestamps and converted to ISO strings
// at the server boundary (lib/firestore-mappers.ts) so they can cross into
// Client Components.

import type { RatingCounts } from "@/lib/rating";

export type SubscriptionTier = "starter" | "pro" | "ultimate";

export type LayoutTemplate =
  | "template_a_bento"
  | "template_b_list"
  | "template_c_hero"
  | "template_d_appstore"
  | "template_e_brutalist";

export type PlatformType = "Media" | "AI" | "VPN" | "Music" | "Productivity" | "Other";

/** users/{uid} */
export interface UserDoc {
  uid: string;
  email: string;
  full_name: string;
  subscription_tier: SubscriptionTier;
  subscription_expiry: string | null;
  created_at: string;
}

export interface StorefrontConfig {
  layout_template: LayoutTemplate;
  accent_color: string;
  tagline?: string;
  banner_url?: string;
  logo_url?: string;
}

/** Public "about this store" content: info pages, footer and the WhatsApp chat button. */
export interface StoreInfo {
  about: string;
  faq: { q: string; a: string }[];
  warranty_policy: string;
  /** +62… or empty. */
  whatsapp: string;
}

export interface CustomDomainStatus {
  state: "pending" | "active";
  /** attached: on the storefront's Vercel project · dns: points at it · live: https://domain serves this store */
  checks: { attached: boolean; dns: boolean; live: boolean };
  message: string | null;
  checked_at: string | null;
}

/**
 * stores/{storeId} — everything here is safe to show on the public storefront.
 * Secrets (WA token, Xendit sub-account) live in stores/{storeId}/private/integrations
 * so a public read of the store document can never leak them.
 */
export interface Store {
  id: string;
  owner_uid: string;
  store_name: string;
  slug: string;
  custom_domain: string | null;
  /** Result of the last "Cek sekarang" run for custom_domain (dashboard only). */
  custom_domain_status?: CustomDomainStatus | null;
  storefront_config: StorefrontConfig;
  store_info: StoreInfo;
  is_active: boolean;
  /** Set by a platform admin; the storefront and bots treat it like a closed store. */
  suspended: boolean;
  created_at: string;
}

export type WaProvider = "fonnte" | "wablas" | "meta";

/** stores/{storeId}/private/integrations — server-only */
export interface StoreIntegrations {
  xendit_sub_account_id: string | null;
  /** Mirrors the XenPlatform account status; split payments are used only when LIVE. */
  xendit_account_status: "INVITED" | "REGISTERED" | "AWAITING_DOCS" | "LIVE" | "SUSPENDED" | null;
  wa_api_provider: WaProvider | null;
  wa_api_token: string | null;
  wa_message_template: string;
}

/** products/{productId} */
export interface Product {
  id: string;
  store_id: string;
  title: string;
  description: string;
  image_url: string | null;
  platform_type: PlatformType;
  price: number;
  /** How long a sold account stays active, used when a credential has no expiry of its own. */
  duration_days: number;
  is_flash_sale: boolean;
  /**
   * Ultimate bundling: ids of the component products (same store). A bundle has no vault
   * stock of its own; each sale allocates one credential from every component.
   */
  bundle_items: string[] | null;
  /** Ultimate "Growth Engine": discounted price while flash_sale_ends_at is in the future. */
  flash_sale_price: number | null;
  flash_sale_ends_at: string | null;
  is_published: boolean;
  /**
   * Denormalised count of AVAILABLE credentials, maintained by the dashboard on every
   * vault change, so the storefront can show stock without ever touching the vault.
   */
  stock_available: number;
  /** Visible review count per star (reviews/{orderId}), maintained in the review transactions. */
  rating: RatingCounts;
  created_at: string;
  updated_at: string;
}

/**
 * reviews/{orderId} — one per PAID order, written by the signed-in buyer who owns it.
 * `hidden` is the seller's moderation switch; hidden reviews don't count in products.rating.
 */
export interface Review {
  id: string;
  store_id: string;
  product_id: string;
  customer_uid: string | null;
  /** Display name ("Indra B."), frozen at write time. */
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  hidden: boolean;
  created_at: string;
  updated_at: string;
}

export type CredentialStatus = "AVAILABLE" | "SOLD" | "EXPIRED";

/** credentials_vault/{credentialId} — server-only, never sent to the storefront */
export interface Credential {
  id: string;
  store_id: string;
  product_id: string;
  account_email: string;
  account_password: string;
  profile_pin: string;
  status: CredentialStatus;
  expiry_date: string | null;
  order_id: string | null;
  created_at: string;
  sold_at: string | null;
}

export type PaymentStatus = "PENDING" | "PAID" | "FAILED";
export type DeliveryStatus = "PENDING" | "SENT_VIA_WA";
export type WarrantyStatus = "VALID" | "CLAIMED" | "REPLACED";

/** orders/{orderId} — orderId has the form ORD-XXXXXXXX */
export interface Order {
  id: string;
  store_id: string;
  product_id: string;
  /** Snapshot at checkout time so later product edits don't rewrite history. */
  product_title: string;
  amount: number;
  /** First allocated credential (kept for single-product orders and older code paths). */
  credential_id: string | null;
  /** All allocated credentials — one per bundle component. */
  credential_ids: string[];
  customer_contact: { email: string; phone: string };
  payment_status: PaymentStatus;
  xendit_invoice_id: string | null;
  xendit_invoice_url: string | null;
  delivery_status: DeliveryStatus;
  /** Last automatic-delivery failure (n8n unreachable, WA not configured…), cleared on success. */
  delivery_error: string | null;
  warranty_status: WarrantyStatus;
  warranty_claim: { reason: string; claimed_at: string } | null;
  /** Set when the order was paid but the vault had no AVAILABLE credential for it. */
  needs_stock: boolean;
  renewal_notified: boolean;
  referral_code: string | null;
  /**
   * SPLIT: paid into the seller's Xendit sub-account with the platform fee split off.
   * PLATFORM: paid into the platform's master account (seller not connected yet);
   * the platform owes the seller amount − platform_fee.
   */
  settlement: "SPLIT" | "PLATFORM" | "MANUAL";
  platform_fee: number;
  /** For PLATFORM-settled orders: whether the platform has transferred amount − fee to the seller. */
  payout_status: "OWED" | "PAID_OUT" | null;
  created_at: string;
  paid_at: string | null;
  access_expires_at: string | null;
}

export type BillingPeriod = "monthly" | "yearly";

/** subscription_payments/{SUB-XXXXXXXX} — plan purchases, paid to the platform's master account */
export interface SubscriptionPayment {
  id: string;
  uid: string;
  tier: Exclude<SubscriptionTier, "starter">;
  period: BillingPeriod;
  amount: number;
  status: "PENDING" | "PAID" | "EXPIRED";
  xendit_invoice_id: string | null;
  xendit_invoice_url: string | null;
  created_at: string;
  paid_at: string | null;
}

/** broadcasts/{id} — Ultimate WhatsApp broadcast CRM */
export interface Broadcast {
  id: string;
  store_id: string;
  message: string;
  audience: "all" | "product";
  product_id: string | null;
  recipients: number;
  status: "SENT" | "FAILED";
  error: string | null;
  created_at: string;
}

/** Price a buyer pays right now. Flash-sale pricing applies only while the timer runs. */
export function effectivePrice(p: Pick<Product, "price" | "is_flash_sale" | "flash_sale_price" | "flash_sale_ends_at">, now = new Date()) {
  const active =
    p.is_flash_sale && p.flash_sale_price != null && p.flash_sale_price < p.price && !!p.flash_sale_ends_at && new Date(p.flash_sale_ends_at) > now;
  return active ? { price: p.flash_sale_price!, original: p.price, endsAt: p.flash_sale_ends_at } : { price: p.price, original: null, endsAt: null };
}
