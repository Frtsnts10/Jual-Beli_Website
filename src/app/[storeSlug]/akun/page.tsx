import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomer } from "@/lib/customer";
import { getStore, storeLinker } from "@/lib/stores";
import { listCustomerOrders, type AccountOrder } from "@/lib/orders";
import { formatDate, formatIDR } from "@/lib/utils";
import { ClaimForm, ReviewForm } from "@/features/account/account-client";

const PAY: Record<string, [string, string]> = {
  PAID: ["Lunas", "bg-emerald-50 text-emerald-700"],
  PENDING: ["Menunggu bayar", "bg-amber-50 text-amber-700"],
  FAILED: ["Gagal", "bg-red-50 text-red-700"],
};
const WARRANTY: Record<string, string> = { CLAIMED: "Klaim diproses", REPLACED: "Akun sudah diganti" };

function Pill({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{children}</span>;
}

function OrderCard({ order, storeKey, buyHref }: { order: AccountOrder; storeKey: string; buyHref: string }) {
  const [payLabel, payCls] = PAY[order.payment_status] ?? [order.payment_status, "bg-neutral-100 text-neutral-600"];
  const expired = !!order.access_expires_at && new Date(order.access_expires_at) < new Date();
  const canClaim = order.payment_status === "PAID" && order.warranty_status !== "CLAIMED" && !expired;
  return (
    <li className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
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
        <Link href={buyHref} className="text-sm font-semibold text-[var(--accent)] hover:underline">
          {order.payment_status === "PAID" ? "Beli lagi / perpanjang" : "Pesan lagi"}
        </Link>
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
      <div className="rounded-2xl border border-dashed bg-white p-10 text-center text-sm text-neutral-500">
        Belum ada pesanan di {store.store_name}.{" "}
        <Link href={`${link("")}#produk`} className="font-medium text-neutral-900 underline underline-offset-4">
          Lihat produk
        </Link>
      </div>
    );
  }
  return (
    <ul className="grid gap-3">
      {orders.map((o) => (
        <OrderCard key={o.id} order={o} storeKey={storeSlug} buyHref={link(`/checkout/${o.product_id}`)} />
      ))}
    </ul>
  );
}
