import "server-only";

// Xendit Invoice API — https://developers.xendit.co/api-reference/#create-invoice
// Phase 2 adds XenPlatform split payments (for-user-id header + fee rule per tier).

export interface InvoiceRequest {
  orderId: string;
  amount: number;
  description: string;
  customer: { email: string; phone: string };
  successUrl: string;
  failureUrl: string;
}

export interface Invoice {
  id: string;
  invoice_url: string;
}

export function paymentMode(): "xendit" | "manual" | "unconfigured" {
  if (process.env.XENDIT_SECRET_KEY) return "xendit";
  // Explicit opt-in: orders stay PENDING until the seller confirms them in the dashboard.
  if (process.env.PAYMENT_MODE === "manual") return "manual";
  return "unconfigured";
}

export async function createInvoice(req: InvoiceRequest): Promise<Invoice> {
  const key = process.env.XENDIT_SECRET_KEY;
  if (!key) throw new Error("XENDIT_SECRET_KEY is not set");

  const res = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: req.orderId,
      amount: req.amount,
      currency: "IDR",
      description: req.description,
      payer_email: req.customer.email,
      customer: { email: req.customer.email, mobile_number: req.customer.phone },
      payment_methods: ["QRIS", "OVO", "DANA", "SHOPEEPAY", "LINKAJA", "ASTRAPAY"],
      invoice_duration: 60 * 60,
      success_redirect_url: req.successUrl,
      failure_redirect_url: req.failureUrl,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Xendit invoice failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as Invoice;
}
