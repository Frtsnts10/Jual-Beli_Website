import "server-only";
import { createHmac } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminMessaging } from "@/lib/firebase/admin";
import { cleanOverrides, getCatalog, resolveFeatures } from "@/lib/catalog";
import type { SubscriptionTier } from "@/types/schema";
import { formatIDR } from "@/lib/utils";

// Tells the seller a buyer uploaded a payment proof, so it gets confirmed quickly:
// - the bell (+ push on devices that allowed it) in the dashboard, for the owner and the
//   store's admins — every plan;
// - a WhatsApp message to the seller's own number (Pengaturan → WhatsApp & Bot), through the
//   same n8n webhook the dashboard uses — Pro & Ultimate with a WhatsApp provider.
// Best effort: never throws, never blocks the buyer.

const tierOf = (owner: FirebaseFirestore.DocumentSnapshot): SubscriptionTier => {
  const tier = (owner.get("subscription_tier") as SubscriptionTier | undefined) ?? "starter";
  const expiry = owner.get("subscription_expiry")?.toMillis?.() as number | undefined;
  return tier !== "starter" && expiry && expiry < Date.now() ? "starter" : tier;
};

const waNumber = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("0") ? `62${d.slice(1)}` : d.startsWith("8") ? `62${d}` : d;
};

async function postToN8n(payload: Record<string, unknown>) {
  const url = process.env.N8N_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!url || !secret) return false;
  const body = JSON.stringify(payload);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature": `sha256=${createHmac("sha256", secret).update(body).digest("hex")}` },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`n8n responded ${res.status}`);
  return true;
}

async function push(uids: string[], n: { title: string; body: string; href: string }) {
  if (process.env.FIRESTORE_EMULATOR_HOST || uids.length === 0) return;
  const snap = await adminDb.collection("push_tokens").where("uid", "in", uids.slice(0, 30)).get();
  const tokens = snap.docs.map((d) => d.id);
  if (!tokens.length) return;
  const base = process.env.DASHBOARD_PUBLIC_URL ?? "";
  const res = await adminMessaging.sendEachForMulticast({
    tokens,
    notification: { title: n.title, body: n.body },
    webpush: { ...(base.startsWith("https://") ? { fcmOptions: { link: `${base}${n.href}` } } : {}), notification: { icon: "/favicon.ico" } },
    data: { href: n.href },
  });
  const dead = res.responses
    .map((r, i) => (!r.success && /registration-token-not-registered|invalid-registration-token/.test(r.error?.code ?? "") ? tokens[i] : null))
    .filter((t): t is string => !!t);
  await Promise.all(dead.map((t) => adminDb.collection("push_tokens").doc(t).delete()));
}

export async function alertSellerOfProof(storeId: string, lead: FirebaseFirestore.DocumentSnapshot, members: FirebaseFirestore.DocumentSnapshot[]) {
  try {
    const [store, integrations] = await Promise.all([
      adminDb.collection("stores").doc(storeId).get(),
      adminDb.collection("stores").doc(storeId).collection("private").doc("integrations").get(),
    ]);
    const total = (lead.get("group_total") as number | undefined) ?? (lead.get("amount") as number);
    const titles = members.map((m) => m.get("product_title") as string);
    const what = titles.length > 1 ? `${titles[0]} + ${titles.length - 1} lainnya` : titles[0];
    const buyer = lead.get("customer_contact.email") as string;
    const note = { title: `Bukti bayar masuk · ${formatIDR(total)}`, body: `${lead.id} · ${what} · ${buyer}`, href: `/${storeId}/orders` };

    const uids = [...new Set([store.get("owner_uid") as string, ...((store.get("admin_uids") as string[] | undefined) ?? [])].filter(Boolean))];
    const batch = adminDb.batch();
    for (const uid of uids)
      batch.create(adminDb.collection("notifications").doc(), { uid, type: "order_proof", ...note, read: false, created_at: FieldValue.serverTimestamp() });
    await batch.commit();
    await push(uids, note).catch((err) => console.error("push failed", err));

    const sellerPhone = integrations.get("wa_notify_seller_phone") as string | null | undefined;
    const provider = integrations.get("wa_api_provider") as string | null | undefined;
    const token = integrations.get("wa_api_token") as string | null | undefined;
    if (!sellerPhone || !provider || !token) return;
    const owner = await adminDb.collection("users").doc(store.get("owner_uid")).get();
    if (!resolveFeatures(await getCatalog(), tierOf(owner), cleanOverrides(owner.get("feature_overrides"))).autoFulfillment) return;
    await postToN8n({
      event: "order.notice",
      kind: "seller_proof",
      order_id: lead.id,
      store_id: storeId,
      to: waNumber(sellerPhone),
      message: `Bukti bayar masuk di ${store.get("store_name")}: ${lead.id} · ${what} · ${formatIDR(total)} dari ${buyer}. Cek mutasi QRIS lalu konfirmasi di dashboard → Pesanan.`,
      wa: {
        provider,
        token,
        phone_number_id: (integrations.get("wa_phone_number_id") as string | undefined) ?? null,
        server: (integrations.get("wa_server") as string | undefined) ?? null,
      },
    });
  } catch (err) {
    console.error(`Seller alert failed for ${lead.id}:`, err);
  }
}
