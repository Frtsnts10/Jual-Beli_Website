/* eslint-disable @next/next/no-img-element -- seller-supplied logo URL */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { adminDb } from "@/lib/firebase/admin";
import { getStore, storeLinker } from "@/lib/stores";
import { ORDER_ID_RE } from "@/lib/order-id";
import { groupIdOf, groupOrders, groupTotal } from "@/lib/order-group";
import { formatDate, formatIDR } from "@/lib/utils";
import { PrintButton } from "@/features/receipt/print-button";
import { btnOutline } from "@/lib/ui";

export const metadata = { title: "Struk pembelian", robots: { index: false } };

const iso = (v: unknown) => (v && typeof v === "object" && "toDate" in v ? (v as { toDate(): Date }).toDate().toISOString() : null);

/** 0812****5678: enough for the buyer to recognise, not enough to copy from a shared screenshot. */
const maskPhone = (p: string) => {
  const local = p.replace(/^\+?62/, "0");
  return local.length > 8 ? `${local.slice(0, 4)}${"*".repeat(local.length - 8)}${local.slice(-4)}` : local;
};

/**
 * Receipt for a paid checkout (one product or a whole cart). Like the payment page, the random
 * order id is the buyer's link; the receipt shows no account credentials.
 */
export default async function ReceiptPage({ params }: { params: Promise<{ storeSlug: string; orderId: string }> }) {
  const { storeSlug, orderId } = await params;
  const store = await getStore(storeSlug);
  if (!store || !ORDER_ID_RE.test(orderId)) notFound();
  const snap = await adminDb.collection("orders").doc(orderId).get();
  if (!snap.exists || snap.get("store_id") !== store.id) notFound();
  const link = await storeLinker(storeSlug);
  if (groupIdOf(snap) !== orderId) redirect(link(`/struk/${groupIdOf(snap)}`));
  if (snap.get("payment_status") !== "PAID") redirect(link(`/bayar/${orderId}`));

  const members = (await groupOrders(snap)).filter((m) => m.get("payment_status") === "PAID");
  const uniqueCode = (snap.get("unique_code") as number) ?? 0;
  const discount = members.reduce((s, m) => s + ((m.get("discount") as number) ?? 0), 0);
  const voucher = members.find((m) => m.get("voucher_code"))?.get("voucher_code") as string | undefined;
  const total =
    members.length === ((snap.get("group_size") as number | undefined) ?? 1) ? groupTotal(snap) : members.reduce((s, m) => s + (m.get("amount") as number), 0);
  const paidAt = iso(snap.get("paid_at"));
  const contact = snap.get("customer_contact") as { email: string; phone: string };

  return (
    <main className="t-page min-h-[calc(100svh-3.5rem)] px-4 py-8 print:min-h-0 print:bg-white print:p-0">
      <article className="t-card mx-auto w-full max-w-md p-6 text-sm print:max-w-none print:border-0 print:shadow-none sm:p-8">
        <header className="flex items-center gap-3 border-b pb-4">
          {store.storefront_config.logo_url && <img src={store.storefront_config.logo_url} alt="" className="size-10 rounded-sm object-cover" />}
          <div className="min-w-0">
            <p className="t-heading truncate text-base font-semibold">{store.store_name}</p>
            <p className="text-xs text-neutral-500">Struk pembelian</p>
          </div>
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-sm bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="size-3.5" /> LUNAS
          </span>
        </header>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-b py-4">
          <dt className="text-neutral-500">No. struk</dt>
          <dd className="text-right font-mono">{orderId}</dd>
          <dt className="text-neutral-500">Dibayar</dt>
          <dd className="text-right">{formatDate(paidAt, true)}</dd>
          <dt className="text-neutral-500">Metode</dt>
          <dd className="text-right">QRIS{store.payment?.merchant_name ? ` · ${store.payment.merchant_name}` : ""}</dd>
          <dt className="text-neutral-500">Pembeli</dt>
          <dd className="text-right break-all">
            {contact.email}
            <br />
            {maskPhone(contact.phone)}
          </dd>
        </dl>

        <ul className="divide-y border-b">
          {members.map((m) => {
            const price = ((m.get("amount") as number) ?? 0) + ((m.get("discount") as number) ?? 0) - ((m.get("unique_code") as number) ?? 0);
            const until = iso(m.get("access_expires_at"));
            return (
              <li key={m.id} className="flex justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium">{m.get("product_title")}</p>
                  <p className="font-mono text-xs text-neutral-500">{m.id}</p>
                  {until && <p className="text-xs text-neutral-500">Aktif s/d {formatDate(until)}</p>}
                </div>
                <span className="shrink-0 tabular-nums">{formatIDR(price)}</span>
              </li>
            );
          })}
        </ul>

        <dl className="grid grid-cols-[1fr_auto] gap-y-1 py-4">
          {discount > 0 && (
            <>
              <dt className="text-neutral-500">Voucher{voucher ? ` ${voucher}` : ""}</dt>
              <dd className="text-right text-emerald-700 tabular-nums">−{formatIDR(discount)}</dd>
            </>
          )}
          {uniqueCode > 0 && (
            <>
              <dt className="text-neutral-500">Kode unik</dt>
              <dd className="text-right tabular-nums">+{formatIDR(uniqueCode)}</dd>
            </>
          )}
          <dt className="text-base font-semibold">Total</dt>
          <dd className="text-right text-base font-bold tabular-nums">{formatIDR(total)}</dd>
        </dl>

        <p className="border-t pt-4 text-xs leading-relaxed text-neutral-500">
          Simpan struk ini sebagai bukti pembelian. Akun dikirim ke WhatsApp pembeli dan bergaransi selama masa aktif — klaim lewat menu Lacak pesanan dengan ID
          di atas.
        </p>
      </article>

      <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-3 print:hidden">
        <PrintButton />
        <Link href={link("/track")} className={btnOutline}>
          Lacak & garansi
        </Link>
      </div>
    </main>
  );
}
