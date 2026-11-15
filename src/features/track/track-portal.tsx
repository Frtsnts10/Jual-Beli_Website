"use client";

import { useActionState } from "react";
import { Loader2, Search, ShieldAlert } from "lucide-react";
import { formatDate, formatIDR } from "@/lib/utils";
import { claimWarranty, trackOrder, type TrackState } from "./actions";
import type { TrackedOrder } from "@/lib/orders";
import { canOpenPayPage, PAY_STATE } from "@/lib/order-status";
import { btnDangerOutline, btnPrimary, field, textarea } from "@/lib/ui";

const LABELS: Record<string, string> = {
  PENDING: "Menunggu",
  SENT_VIA_WA: "Terkirim via WhatsApp",
  VALID: "Aktif",
  CLAIMED: "Klaim diproses",
  REPLACED: "Akun sudah diganti",
};

const inputCls = field;

/** payBase: "/bayar/" link prefix for continuing an unpaid QRIS order. */
export function TrackPortal({ storeKey, payBase, email }: { storeKey: string; payBase: string; email?: string }) {
  const [state, action, pending] = useActionState<TrackState, FormData>(trackOrder.bind(null, storeKey), undefined);

  return (
    <div className="grid gap-6">
      <form action={action} className="grid gap-3 t-card p-5">
        <input name="order_id" required placeholder="ID Invoice (ORD-XXXXXXXX)" defaultValue={state?.orderId} className={`${inputCls} font-mono uppercase`} />
        <input name="email" type="email" required placeholder="Email saat checkout" defaultValue={state?.email ?? email} className={inputCls} />
        {state?.error && !state.order && <p className="text-sm text-red-600">{state.error}</p>}
        <button disabled={pending} className={btnPrimary}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Lacak pesanan
        </button>
      </form>
      {state?.order && <OrderCard key={state.order.id} storeKey={storeKey} order={state.order} email={state.email ?? ""} payHref={`${payBase}${state.order.id}`} />}
    </div>
  );
}

function OrderCard({ storeKey, order: initial, email, payHref }: { storeKey: string; order: TrackedOrder; email: string; payHref: string }) {
  const [claim, claimAction, claiming] = useActionState<TrackState, FormData>(claimWarranty.bind(null, storeKey), undefined);
  const order = claim?.order ?? initial;
  const expired = order.access_expires_at ? new Date(order.access_expires_at) < new Date() : false;
  const canClaim = order.payment_status === "PAID" && order.warranty_status !== "CLAIMED" && !expired;

  const rows: [string, string][] = [
    ["ID Invoice", order.id],
    ["Produk", order.product_title],
    ["Total", formatIDR(order.amount)],
    ["Tanggal", formatDate(order.created_at, true)],
    ["Pembayaran", PAY_STATE[order.pay_state].label],
    ["Pengiriman", LABELS[order.delivery_status] ?? order.delivery_status],
    ["Aktif sampai", order.access_expires_at ? `${formatDate(order.access_expires_at)}${expired ? " (habis)" : ""}` : "—"],
    ["Garansi", LABELS[order.warranty_status] ?? order.warranty_status],
  ];

  return (
    <div className="t-card p-5">
      <dl className="grid gap-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-neutral-500">{k}</dt>
            <dd className="min-w-0 text-right font-medium [overflow-wrap:anywhere]">{v}</dd>
          </div>
        ))}
      </dl>
      {canOpenPayPage(order.pay_state) && (
        <a href={payHref} className={`${btnPrimary} mt-4 w-full`}>
          Lanjutkan pembayaran / cek status
        </a>
      )}
      {claim?.claimed && <p className="mt-4 rounded-[var(--r-inner)] bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Klaim terkirim. Penjual akan mengganti akun Anda secepatnya.</p>}
      {canClaim && (
        <form action={claimAction} className="mt-5 grid gap-3 border-t pt-5">
          <input type="hidden" name="order_id" value={order.id} />
          <input type="hidden" name="email" value={email} />
          <label className="grid gap-1.5 text-sm font-medium">
            Ada masalah dengan akun?
            <textarea name="reason" required minLength={10} rows={3} placeholder="Contoh: password tidak bisa dipakai login sejak tadi pagi" className={textarea} />
          </label>
          {claim?.error && <p className="text-sm text-red-600">{claim.error}</p>}
          <button disabled={claiming} className={btnDangerOutline}>
            {claiming ? <Loader2 className="size-4 animate-spin" /> : <ShieldAlert className="size-4" />} Klaim Garansi / Lapor Masalah
          </button>
        </form>
      )}
    </div>
  );
}
