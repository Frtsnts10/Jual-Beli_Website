import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { TIERS } from "@/config/tiers";
import type { SubscriptionTier } from "@/types/schema";

// Xendit Invoice API + XenPlatform split payments.
//   POST /v2/invoices   (`for-user-id`: seller sub-account, `with-split-rule`: fee route)
//   POST /split_rules   routes a percentage of each transaction to the platform account
// XENDIT_API_BASE lets tests point at a mock.

const BASE = process.env.XENDIT_API_BASE ?? "https://api.xendit.co";

async function xendit<T>(path: string, body: unknown, headers: Record<string, string> = {}): Promise<T> {
  const key = process.env.XENDIT_SECRET_KEY;
  if (!key) throw new Error("XENDIT_SECRET_KEY is not set");
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Xendit ${path} failed (${res.status}): ${text}`);
  return JSON.parse(text) as T;
}

export function paymentMode(): "xendit" | "manual" | "unconfigured" {
  if (process.env.XENDIT_SECRET_KEY) return "xendit";
  // Explicit opt-in: orders stay PENDING until the seller confirms them in the dashboard.
  if (process.env.PAYMENT_MODE === "manual") return "manual";
  return "unconfigured";
}

/**
 * One split rule per plan, sending feePercent of every sub-account transaction to the
 * platform's master account (XENDIT_MASTER_ACCOUNT_ID). Created lazily and cached in
 * Firestore; recreated if the plan's fee changes.
 */
async function splitRuleFor(tier: SubscriptionTier): Promise<string> {
  const master = process.env.XENDIT_MASTER_ACCOUNT_ID;
  if (!master) throw new Error("XENDIT_MASTER_ACCOUNT_ID is not set");
  const percent = TIERS[tier].feePercent;
  const ref = adminDb.collection("platform_config").doc("xendit_split_rules");
  const cached = (await ref.get()).get(tier) as { id: string; percent: number; destination: string } | undefined;
  if (cached && cached.percent === percent && cached.destination === master) return cached.id;

  const rule = await xendit<{ id: string }>("/split_rules", {
    name: `Platform fee ${TIERS[tier].name} ${percent}%`,
    description: `Fee platform paket ${TIERS[tier].name}`,
    routes: [{ percent_amount: percent, currency: "IDR", destination_account_id: master, reference_id: `platform-fee-${tier}` }],
  });
  await ref.set({ [tier]: { id: rule.id, percent, destination: master } }, { merge: true });
  return rule.id;
}

/** Channels the invoice offers; the buyer's last one can be preselected for one-tap checkout. */
export const PAYMENT_CHANNELS = ["QRIS", "OVO", "DANA", "SHOPEEPAY", "LINKAJA", "ASTRAPAY"] as const;
export type PaymentChannel = (typeof PAYMENT_CHANNELS)[number];
export const isPaymentChannel = (v: unknown): v is PaymentChannel => PAYMENT_CHANNELS.includes(v as PaymentChannel);

export interface InvoiceRequest {
  orderId: string;
  amount: number;
  description: string;
  customer: { email: string; phone: string };
  successUrl: string;
  failureUrl: string;
  /** Seller's LIVE XenPlatform sub-account; without it the platform account collects. */
  subAccountId: string | null;
  tier: SubscriptionTier;
  /** Offer only this channel (buyer chose "pay the same way again"). */
  channel?: PaymentChannel | null;
}

export async function createInvoice(req: InvoiceRequest) {
  const split = req.subAccountId && process.env.XENDIT_MASTER_ACCOUNT_ID;
  const headers: Record<string, string> = split
    ? { "for-user-id": req.subAccountId!, "with-split-rule": await splitRuleFor(req.tier) }
    : {};

  const invoice = await xendit<{ id: string; invoice_url: string }>(
    "/v2/invoices",
    {
      external_id: req.orderId,
      amount: req.amount,
      currency: "IDR",
      description: req.description,
      payer_email: req.customer.email,
      customer: { email: req.customer.email, mobile_number: req.customer.phone },
      payment_methods: req.channel ? [req.channel] : [...PAYMENT_CHANNELS],
      invoice_duration: 60 * 60,
      success_redirect_url: req.successUrl,
      failure_redirect_url: req.failureUrl,
    },
    headers
  );
  return { ...invoice, settlement: split ? ("SPLIT" as const) : ("PLATFORM" as const) };
}
