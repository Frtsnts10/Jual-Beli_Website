"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Lock } from "lucide-react";
import { startCheckout, type CheckoutState } from "./actions";

const CHANNEL_NAMES: Record<string, string> = { QRIS: "QRIS", OVO: "OVO", DANA: "DANA", SHOPEEPAY: "ShopeePay", LINKAJA: "LinkAja", ASTRAPAY: "AstraPay" };

export interface CheckoutBuyer {
  email: string;
  phone: string;
  lastChannel: string | null;
}

export function CheckoutForm({
  storeKey,
  productId,
  soldOut,
  buyer,
  signInHref,
}: {
  storeKey: string;
  productId: string;
  soldOut: boolean;
  /** Signed-in buyer: contact prefilled, last payment channel offered. */
  buyer: CheckoutBuyer | null;
  signInHref: string;
}) {
  const [sameChannel, setSameChannel] = useState(!!buyer?.lastChannel);
  const [state, action, pending] = useActionState<CheckoutState, FormData>(startCheckout.bind(null, storeKey, productId), undefined);

  useEffect(() => {
    // Xendit's hosted invoice (or the success page in manual mode) is on another origin/route.
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
          className="rounded-lg border border-neutral-300 px-3 py-2.5 font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
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
          defaultValue={state?.phone ?? (buyer?.phone ? buyer.phone.replace(/^\+62/, "0") : undefined)}
          placeholder="0812xxxxxxxx"
          className="rounded-lg border border-neutral-300 px-3 py-2.5 font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
        />
        <span className="text-xs font-normal text-neutral-500">Akun akan dikirim ke nomor ini.</span>
      </label>
      {buyer?.lastChannel && CHANNEL_NAMES[buyer.lastChannel] && (
        <fieldset className="grid gap-2 text-sm">
          <legend className="mb-1.5 font-medium">Pembayaran</legend>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2.5 has-checked:border-[var(--accent)] has-checked:ring-2 has-checked:ring-[var(--accent)]/20">
            <input type="radio" name="channel" value={buyer.lastChannel} checked={sameChannel} onChange={() => setSameChannel(true)} className="accent-[var(--accent)]" />
            Bayar pakai {CHANNEL_NAMES[buyer.lastChannel]} lagi
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2.5 has-checked:border-[var(--accent)] has-checked:ring-2 has-checked:ring-[var(--accent)]/20">
            <input type="radio" name="channel" value="" checked={!sameChannel} onChange={() => setSameChannel(false)} className="accent-[var(--accent)]" />
            Pilih metode lain (QRIS / e-wallet)
          </label>
        </fieldset>
      )}
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <button
        type="submit"
        disabled={busy || soldOut}
        className="flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-3 text-sm font-semibold text-[var(--accent-fg)] transition active:scale-[0.99] disabled:opacity-50"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
        {soldOut
          ? "Stok habis"
          : busy
            ? "Membuat tagihan…"
            : sameChannel && buyer?.lastChannel
              ? `Bayar dengan ${CHANNEL_NAMES[buyer.lastChannel] ?? buyer.lastChannel}`
              : "Bayar dengan QRIS / E-Wallet"}
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
