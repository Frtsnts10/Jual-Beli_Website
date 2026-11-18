"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, Loader2 } from "lucide-react";
import { simulateDemoPayment } from "./actions";
import { btnOutline } from "@/lib/ui";

/** Demo store only: skips the QRIS transfer so the paid flow (receipt, Akun, dashboard) can be tried. */
export function DemoPayButton({ storeKey, orderId }: { storeKey: string; orderId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="grid gap-2 rounded-sm border border-dashed border-violet-300 bg-violet-50 p-3 text-center text-sm">
      <p className="text-violet-800">
        <b>Toko demo</b> — tidak perlu transfer sungguhan.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await simulateDemoPayment(storeKey, orderId);
            if (res.error) return setError(res.error);
            router.refresh();
          })
        }
        className={`${btnOutline} w-full`}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <FlaskConical className="size-4" />} Simulasikan pembayaran berhasil
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
