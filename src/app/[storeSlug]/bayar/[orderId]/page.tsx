import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { CheckCircle2, Clock, Hourglass, ShieldCheck, XCircle } from "lucide-react";
import { adminDb } from "@/lib/firebase/admin";
import { getStore, storeLinker } from "@/lib/stores";
import { ORDER_ID_RE } from "@/lib/order-id";
import { qrisWithAmount } from "@/lib/qris";
import { formatDate, formatIDR } from "@/lib/utils";
import { TIERS } from "@/config/tiers";
import { AutoRefresh } from "@/features/checkout/auto-refresh";
import { CopyAmount, PayTimer, ProofUpload } from "@/features/payment/pay-client";

export const metadata = { title: "Pembayaran", robots: { index: false } };

const iso = (v: unknown) => (v && typeof v === "object" && "toDate" in v ? (v as { toDate(): Date }).toDate().toISOString() : null);

export default async function PayPage({ params }: { params: Promise<{ storeSlug: string; orderId: string }> }) {
  const { storeSlug, orderId } = await params;
  const store = await getStore(storeSlug);
  if (!store || !ORDER_ID_RE.test(orderId)) notFound();
  const snap = await adminDb.collection("orders").doc(orderId).get();
  if (!snap.exists || snap.get("store_id") !== store.id) notFound();

  const link = await storeLinker(storeSlug);
  const status = snap.get("payment_status") as "PENDING" | "PAID" | "FAILED";
  const amount = snap.get("amount") as number;
  const uniqueCode = (snap.get("unique_code") as number) ?? 0;
  const discount = (snap.get("discount") as number) ?? 0;
  const payBy = iso(snap.get("pay_by"));
  const proofAt = iso(snap.get("proof_uploaded_at"));
  const expired = status === "PENDING" && !proofAt && !!payBy && new Date(payBy) < new Date();
  const linked = !!snap.get("customer_uid");
  const auto = TIERS[store.tier].autoFulfillment;

  const summary = (
    <div className="rounded-xl bg-neutral-50 p-4 text-left text-sm">
      <Row label="ID pesanan" value={<span className="font-mono font-medium">{orderId}</span>} />
      <Row label="Produk" value={snap.get("product_title")} />
      {discount > 0 && <Row label={`Voucher ${snap.get("voucher_code")}`} value={<span className="text-emerald-700">−{formatIDR(discount)}</span>} />}
      {uniqueCode > 0 && <Row label="Kode unik" value={`+${formatIDR(uniqueCode)}`} />}
      <Row label="Total" value={<b>{formatIDR(amount)}</b>} />
    </div>
  );

  let body: React.ReactNode;
  if (status === "PAID") {
    body = (
      <div className="grid gap-4 text-center">
        <CheckCircle2 className="mx-auto size-14 text-emerald-500" />
        <h1 className="text-xl font-semibold">Pembayaran dikonfirmasi!</h1>
        <p className="text-neutral-600">
          {auto ? "Akun Anda sedang dikirim ke WhatsApp secara otomatis." : "Penjual akan segera mengirim akun ke WhatsApp Anda."}
        </p>
        {summary}
      </div>
    );
  } else if (status === "FAILED" || expired) {
    const reason = (snap.get("rejected_reason") as string | null) ?? (expired ? "Batas waktu pembayaran sudah lewat." : null);
    body = (
      <div className="grid gap-4 text-center">
        <XCircle className="mx-auto size-14 text-red-500" />
        <h1 className="text-xl font-semibold">Pesanan dibatalkan</h1>
        {reason && <p className="text-neutral-600">{reason}</p>}
        <p className="text-sm text-neutral-500">Jika Anda sudah terlanjur membayar, hubungi penjual dengan menyebutkan ID pesanan.</p>
        {summary}
        <Link href={link(`/checkout/${snap.get("product_id")}`)} className="rounded-xl bg-[var(--accent)] py-3 font-semibold text-[var(--accent-fg)]">
          Pesan ulang
        </Link>
      </div>
    );
  } else if (proofAt) {
    body = (
      <div className="grid gap-4 text-center">
        <AutoRefresh everyMs={8000} maxTries={225} />
        <Hourglass className="mx-auto size-14 animate-pulse text-amber-500" />
        <h1 className="text-xl font-semibold">Menunggu konfirmasi penjual</h1>
        <p className="text-neutral-600">
          Bukti pembayaran terkirim {formatDate(proofAt, true)}. Penjual sedang mengecek dana masuk; halaman ini diperbarui otomatis.
        </p>
        {summary}
        <ProofUpload storeKey={storeSlug} orderId={orderId} replacing />
      </div>
    );
  } else if (!store.payment) {
    body = <p className="text-center text-neutral-600">Penjual sedang memperbarui metode pembayaran. Silakan hubungi penjual.</p>;
  } else {
    // Same QRIS the seller prints, with this order's exact total filled in.
    const svg = await QRCode.toString(qrisWithAmount(store.payment.qris_payload, amount), { type: "svg", margin: 1, errorCorrectionLevel: "M" });
    body = (
      <div className="grid gap-5">
        <div className="text-center">
          <p className="text-sm text-neutral-500">Scan & bayar ke</p>
          <h1 className="text-lg font-semibold break-words">{store.payment.merchant_name || store.store_name}</h1>
        </div>
        <div
          className="mx-auto w-full max-w-64 rounded-2xl border bg-white p-3 [&_svg]:h-auto [&_svg]:w-full"
          role="img"
          aria-label={`QRIS ${formatIDR(amount)}`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <div className="text-center">
          <p className="text-sm text-neutral-500">Bayar tepat</p>
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {formatIDR(amount)} <CopyAmount amount={amount} label={formatIDR(amount)} />
          </p>
          {uniqueCode > 0 && <p className="mt-1 text-xs text-neutral-500">Termasuk kode unik {uniqueCode} supaya pembayaran Anda mudah dicocokkan.</p>}
          {payBy && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-800">
              <Clock className="size-4" /> Selesaikan dalam <PayTimer payBy={payBy} />
            </p>
          )}
        </div>
        <ol className="grid gap-1.5 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700">
          <li>1. Buka aplikasi e-wallet / m-banking (GoPay, OVO, DANA, ShopeePay, BCA, dll).</li>
          <li>2. Scan QR di atas — nominal sudah terisi otomatis. Pastikan {formatIDR(amount)}.</li>
          <li>3. Screenshot bukti berhasil, lalu unggah di bawah.</li>
        </ol>
        <ProofUpload storeKey={storeSlug} orderId={orderId} />
        <p className="flex items-center justify-center gap-1.5 text-xs text-neutral-500">
          <ShieldCheck className="size-3.5" /> Dana langsung ke penjual. Akun dikirim setelah penjual mengonfirmasi.
        </p>
        {summary}
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100svh-3.5rem)] bg-neutral-50 px-4 py-8">
      <div className="mx-auto w-full max-w-md rounded-2xl border bg-white p-5 shadow-sm sm:p-8">{body}</div>
      <div className="mt-6 flex justify-center gap-5 text-sm">
        <Link href={link(linked ? "/akun" : "/track")} className="font-medium underline underline-offset-4">
          {linked ? "Pesanan saya" : "Lacak pesanan"}
        </Link>
        <Link href={link("")} className="text-neutral-500 underline underline-offset-4">
          Kembali ke toko
        </Link>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-0.5">
      <span className="shrink-0 text-neutral-500">{label}</span>
      <span className="min-w-0 text-right break-words">{value}</span>
    </div>
  );
}
