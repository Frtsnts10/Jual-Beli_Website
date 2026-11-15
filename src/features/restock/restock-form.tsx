"use client";

import { useActionState } from "react";
import { BellRing, CheckCircle2, Loader2 } from "lucide-react";
import { requestRestock, type RestockState } from "./actions";
import { btnPrimary, field } from "@/lib/ui";

/** Sold-out box: leave a WhatsApp number, get a message when the seller restocks. */
export function RestockForm({ storeKey, productId, phone }: { storeKey: string; productId: string; phone?: string }) {
  const [state, action, pending] = useActionState<RestockState, FormData>(requestRestock.bind(null, storeKey, productId), undefined);

  if (state?.ok) {
    return (
      <div id="kabari" className="flex scroll-mt-24 items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
        <span>Siap! Kami kirim WhatsApp ke {state.phone} begitu stok tersedia lagi.</span>
      </div>
    );
  }
  return (
    <form id="kabari" action={action} className="grid scroll-mt-24 gap-2 rounded-xl border bg-white p-4 text-sm">
      <p className="flex items-center gap-2 font-semibold">
        <BellRing className="size-4 text-[var(--accent)]" /> Stok habis — kabari saya
      </p>
      <p className="text-neutral-500">Tinggalkan nomor WhatsApp, kami kabari saat stok masuk lagi.</p>
      <div className="flex gap-2">
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          required
          autoComplete="tel"
          aria-label="Nomor WhatsApp"
          placeholder="0812xxxxxxxx"
          defaultValue={state?.phone ?? phone?.replace(/^\+?62/, "0")}
          className={field}
        />
        <button disabled={pending} className={btnPrimary}>
          {pending && <Loader2 className="size-4 animate-spin" />} Kabari saya
        </button>
      </div>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
