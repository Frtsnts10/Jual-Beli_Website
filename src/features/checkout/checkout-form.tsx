"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Lock, TicketPercent, X } from "lucide-react";
import { formatIDR } from "@/lib/utils";
import { normaliseCode } from "@/lib/voucher";
import { checkVoucher, startCheckout, type CheckoutState, type VoucherPreview } from "./actions";
import { btnOutline, btnPrimary, field } from "@/lib/ui";

export interface CheckoutBuyer {
  email: string;
  phone: string;
}

export function CheckoutForm({
  storeKey,
  productId,
  soldOut,
  buyer,
  signInHref,
  vouchers,
}: {
  storeKey: string;
  productId: string;
  soldOut: boolean;
  /** Signed-in buyer: contact prefilled. */
  buyer: CheckoutBuyer | null;
  signInHref: string;
  /** The store's plan includes discount codes. */
  vouchers: boolean;
}) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(startCheckout.bind(null, storeKey, productId), undefined);

  useEffect(() => {
    // The QRIS payment page for the new order.
    if (state?.redirect) window.location.assign(state.redirect);
  }, [state?.redirect]);

  const busy = pending || !!state?.redirect;
  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-1.5 text-sm font-medium">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state?.email ?? buyer?.email}
          placeholder="nama@email.com"
          className={field}
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Nomor WhatsApp
        <input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          defaultValue={state?.phone ?? (buyer?.phone ? buyer.phone.replace(/^\+?62/, "0") : undefined)}
          placeholder="0812xxxxxxxx"
          className={field}
        />
        <span className="text-xs font-normal text-neutral-500">Akun akan dikirim ke nomor ini.</span>
      </label>
      {vouchers && <VoucherField storeKey={storeKey} productId={productId} initial={state?.voucher} />}
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <button
        type="submit"
        disabled={busy || soldOut}
        className={`${btnPrimary} w-full`}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
        {soldOut
          ? "Stok habis"
          : busy
            ? "Membuat pesanan…"
            : "Lanjut bayar dengan QRIS"}
      </button>
      {!buyer && (
        <p className="text-center text-xs text-neutral-500">
          <Link href={signInHref} className="font-medium text-neutral-900 underline underline-offset-4">
            Masuk
          </Link>{" "}
          untuk checkout lebih cepat & melihat riwayat pesanan.
        </p>
      )}
    </form>
  );
}

function VoucherField({ storeKey, productId, initial }: { storeKey: string; productId: string; initial?: string }) {
  const [code, setCode] = useState(initial ?? "");
  const [open, setOpen] = useState(!!initial);
  const [result, setResult] = useState<VoucherPreview | null>(null);
  const [checking, start] = useTransition();
  const applied = result?.ok ? result : null;
  const apply = () => start(async () => setResult(await checkVoucher(storeKey, productId, code)));

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 justify-self-start text-sm font-medium text-[var(--accent)] hover:underline">
        <TicketPercent className="size-4" /> Punya kode voucher?
      </button>
    );
  }
  return (
    <div className="grid gap-2 text-sm">
      {/* Only an applied code is submitted; the server checks it again when creating the order. */}
      <input type="hidden" name="voucher" value={applied?.code ?? ""} />
      {applied ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-emerald-800">
          <span className="min-w-0">
            <b className="font-mono">{applied.code}</b> · hemat {formatIDR(applied.discount)}
            <span className="block text-xs">Total bayar {formatIDR(applied.total)}</span>
          </span>
          <button type="button" aria-label="Hapus voucher" onClick={() => setResult(null)} className="shrink-0 rounded p-1 hover:bg-emerald-100">
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(normaliseCode(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (code) apply();
              }
            }}
            maxLength={20}
            placeholder="Kode voucher"
            aria-label="Kode voucher"
            className={`${field} font-mono uppercase`}
          />
          <button type="button" disabled={!code || checking} onClick={apply} className={btnOutline}>
            {checking && <Loader2 className="size-4 animate-spin" />} Pakai
          </button>
        </div>
      )}
      {result && !result.ok && <p className="text-xs text-red-600">{result.error}</p>}
    </div>
  );
}
