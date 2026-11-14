"use client";

import { useActionState, useEffect } from "react";
import { Loader2, Lock } from "lucide-react";
import { startCheckout, type CheckoutState } from "./actions";

export function CheckoutForm({ storeKey, productId, soldOut }: { storeKey: string; productId: string; soldOut: boolean }) {
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
          defaultValue={state?.email}
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
          defaultValue={state?.phone}
          placeholder="0812xxxxxxxx"
          className="rounded-lg border border-neutral-300 px-3 py-2.5 font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
        />
        <span className="text-xs font-normal text-neutral-500">Akun akan dikirim ke nomor ini.</span>
      </label>
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <button
        type="submit"
        disabled={busy || soldOut}
        className="flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-3 text-sm font-semibold text-[var(--accent-fg)] transition active:scale-[0.99] disabled:opacity-50"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
        {soldOut ? "Stok habis" : busy ? "Membuat tagihan…" : "Bayar dengan QRIS / E-Wallet"}
      </button>
    </form>
  );
}
