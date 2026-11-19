import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomer } from "@/lib/customer";
import { getStore, storeLinker } from "@/lib/stores";
import { listCustomerOrders, type AccountOrder } from "@/lib/orders";
import { AutoRefresh } from "@/features/checkout/auto-refresh";
import { formatDate, formatIDR } from "@/lib/utils";
import { canOpenPayPage, PAY_STATE } from "@/lib/order-status";
import { ClaimForm, ReviewForm } from "@/features/account/account-client";

const WARRANTY: Record<string, string> = { CLAIMED: "Klaim diproses", REPLACED: "Akun sudah diganti" };

function Pill({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`t-pill px-2 py-0.5 text-xs font-medium ${className}`}>{children}</span>;
}

function OrderCard({ order, storeKey, buyHref, payHref, receiptHref }: { order: AccountOrder; storeKey: string; buyHref: string; payHref: string; receiptHref: string }) {
  const { label: payLabel, tone: payCls } = PAY_STATE[order.pay_state];
  const expired = !!order.access_expires_at && new Date(order.access_expires_at) < new Date();
  const canClaim = order.payment_status === "PAID" && order.warranty_status !== "CLAIMED" && !expired;
  return (
    <li className="t-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{order.product_title}</p>
          <p className="font-mono text-xs text-neutral-500">
            {order.id} · {formatDate(order.created_at, true)}
          </p>
        </div>
        <span className="shrink-0 font-semibold tabular-nums">{formatIDR(order.amount)}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Pill className={payCls}>{payLabel}</Pill>
        {order.payment_status === "PAID" && (
          <Pill className={order.delivery_status === "SENT_VIA_WA" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600"}>
            {order.delivery_status === "SENT_VIA_WA" ? "Terkirim ke WhatsApp" : "Sedang diproses"}
          </Pill>
        )}
        {WARRANTY[order.warranty_status] && <Pill className="bg-red-50 text-red-700">{WARRANTY[order.warranty_status]}</Pill>}
        {order.access_expires_at && (
          <span className={`text-xs ${expired ? "text-red-600" : "text-neutral-500"}`}>
            {expired ? "Berakhir" : "Aktif s/d"} {formatDate(order.access_expires_at)}
          </span>
        )}
      </div>
      {order.warranty_status === "CLAIMED" && order.claim_reason && <p className="mt-2 text-xs text-neutral-500">“{order.claim_reason}”</p>}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-3">
        {canOpenPayPage(order.pay_state) ? (
          <Link href={payHref} className="text-sm font-semibold text-[var(--accent)] hover:underline">
            {order.pay_state === "AWAITING_CONFIRMATION" ? "Lihat status pembayaran" : "Lanjutkan pembayaran"}
          </Link>
        ) : (
          <Link href={buyHref} className="text-sm font-semibold text-[var(--accent)] hover:underline">
            {order.payment_status === "PAID" ? "Beli lagi / perpanjang" : "Pesan lagi"}
          </Link>
        )}
        {order.payment_status === "PAID" && (
          <Link href={receiptHref} className="text-sm font-medium text-neutral-600 hover:underline">
            Struk
          </Link>
        )}
        {canClaim && <ClaimForm storeKey={storeKey} orderId={order.id} />}
      </div>
      {order.payment_status === "PAID" && (
        <div className="mt-3 border-t pt-3">
          <ReviewForm storeKey={storeKey} orderId={order.id} review={order.review} />
        </div>
      )}
    </li>
  );
}

export default async function AccountOrdersPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params;
  const [store, customer, link] = await Promise.all([getStore(storeSlug), getCustomer(), storeLinker(storeSlug)]);
  if (!store || !customer) notFound(); // the layout already redirected signed-out visitors
  const orders = await listCustomerOrders(store.id, customer);

  if (orders.length === 0) {
    return (
      <div className="t-card-dashed p-10 text-center text-sm text-neutral-500">
        Belum ada pesanan di {store.store_name}.{" "}
        <Link href={`${link("")}#produk`} className="font-medium text-neutral-900 underline underline-offset-4">
          Lihat produk
        </Link>
      </div>
    );
  }
  // Something the seller still has to act on (confirm a payment, send the account, answer a
  // claim): keep the list fresh so the buyer sees it change without reloading.
  const waiting = orders.some((o) => o.payment_status === "PENDING" || (o.payment_status === "PAID" && o.delivery_status === "PENDING") || o.warranty_status === "CLAIMED");
  return (
    <ul className="grid gap-3">
      {waiting && <AutoRefresh everyMs={10_000} maxTries={180} />}
      {orders.map((o) => (
        <OrderCard key={o.id} order={o} storeKey={storeSlug} buyHref={link(`/checkout/${o.product_id}`)} payHref={link(`/bayar/${o.id}`)} receiptHref={link(`/struk/${o.id}`)} />
      ))}
    </ul>
  );
}
