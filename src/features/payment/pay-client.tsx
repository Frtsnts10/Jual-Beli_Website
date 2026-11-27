"use client";

/* eslint-disable @next/next/no-img-element -- local preview of the buyer's own screenshot */
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, ImageUp, Loader2 } from "lucide-react";
import { uploadPaymentProof } from "./actions";
import { dataUrlToBlob } from "@/lib/image-blob";
import { btnOutline, btnPrimary } from "@/lib/ui";

/** Screenshots can be several MB: re-encode to a ≤1280px JPEG before sending (keeps text legible). */
async function compress(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  for (const q of [0.8, 0.65, 0.5]) {
    const url = canvas.toDataURL("image/jpeg", q);
    if (url.length < 900_000) return url;
  }
  return canvas.toDataURL("image/jpeg", 0.4);
}

export function ProofUpload({ storeKey, orderId, replacing = false }: { storeKey: string; orderId: string; replacing?: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function pick(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      setPreview(await compress(file));
    } catch {
      setError("Gambar tidak bisa dibuka. Coba screenshot lain (JPG/PNG).");
    }
  }

  return (
    <div className="grid gap-3">
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      {preview ? (
        <div className="grid gap-3">
          <img src={preview} alt="Pratinjau bukti pembayaran" className="mx-auto t-media max-h-72 object-contain" />
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => input.current?.click()} disabled={pending} className={btnOutline}>
              Ganti gambar
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await uploadPaymentProof(storeKey, orderId, dataUrlToBlob(preview));
                  if (res?.error) return setError(res.error);
                  setPreview(null);
                  router.refresh();
                })
              }
              className={btnPrimary}
            >
              {pending && <Loader2 className="size-4 animate-spin" />} Kirim bukti
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className={
            replacing
              ? "text-sm font-medium text-neutral-600 underline underline-offset-4"
              : `${btnPrimary} w-full`
          }
        >
          {!replacing && <ImageUp className="size-4" />} {replacing ? "Salah gambar? Unggah ulang bukti" : "Sudah bayar? Unggah bukti"}
        </button>
      )}
      {error && <p className="rounded-[var(--r-inner)] bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}

export function CopyAmount({ amount, label }: { amount: number; label: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(String(amount)).then(() => setCopied(true))}
      className="inline-flex items-center gap-1 rounded-[var(--r-pill)] px-1.5 py-0.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100"
      aria-label={`Salin nominal ${label}`}
    >
      {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />} {copied ? "Tersalin" : "Salin"}
    </button>
  );
}

/** mm:ss left to pay; refreshes the page when time is up so the expired state shows. */
export function PayTimer({ payBy }: { payBy: string }) {
  const router = useRouter();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const left = now === null ? null : new Date(payBy).getTime() - now;
  const expired = left !== null && left <= 0;
  useEffect(() => {
    if (expired) router.refresh();
  }, [expired, router]);
  if (left === null) return null;
  const s = Math.max(0, Math.floor(left / 1000));
  return (
    <span className="font-mono font-semibold tabular-nums">
      {String(Math.floor(s / 60)).padStart(2, "0")}:{String(s % 60).padStart(2, "0")}
    </span>
  );
}
