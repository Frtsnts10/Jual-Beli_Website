import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { adminDb } from "@/lib/firebase/admin";
import { getStore, storeLinker } from "@/lib/stores";
import { ORDER_ID_RE } from "@/lib/order-id";
import { getCustomer } from "@/lib/customer";
import { formatIDR } from "@/lib/utils";
import { TIERS } from "@/config/tiers";
import { AutoRefresh } from "@/features/checkout/auto-refresh";

export const metadata = { title: "Status pembayaran", robots: { index: false } };

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { storeSlug } = await params;
  const { order: orderId } = await searchParams;
  const store = await getStore(storeSlug);
  if (!store || !orderId || !ORDER_ID_RE.test(orderId)) notFound();

  const snap = await adminDb.collection("orders").doc(orderId).get();
  if (!snap.exists || snap.get("store_id") !== store.id) notFound();
  const status = snap.get("payment_status") as string;
  const link = await storeLinker(storeSlug);
  const auto = TIERS[store.tier].autoFulfillment;
  const linked = !!snap.get("customer_uid");
  const signedIn = !!(await getCustomer());

  return (
    <main className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        {status === "PAID" ? (
          <>
            <CheckCircle2 className="mx-auto size-14 text-emerald-500" />
            <h1 className="mt-4 text-xl font-semibold">Pembayaran berhasil!</h1>
            <p className="mt-2 text-neutral-600">
              {auto
                ? "Terima kasih! Akun kredensial Anda sedang dikirim ke WhatsApp Anda secara otomatis."
                : "Terima kasih! Penjual akan segera mengirim akun kredensial ke WhatsApp Anda."}
            </p>
          </>
        ) : status === "FAILED" ? (
          <>
            <XCircle className="mx-auto size-14 text-red-500" />
            <h1 className="mt-4 text-xl font-semibold">Pembayaran gagal atau kedaluwarsa</h1>
            <p className="mt-2 text-neutral-600">Silakan ulangi pembelian.</p>
          </>
        ) : (
          <>
            <AutoRefresh />
            <Clock className="mx-auto size-14 animate-pulse text-amber-500" />
            <h1 className="mt-4 text-xl font-semibold">Menunggu konfirmasi pembayaran…</h1>
            <p className="mt-2 text-neutral-600">Halaman ini akan diperbarui otomatis setelah pembayaran terkonfirmasi.</p>
            {snap.get("xendit_invoice_url") && (
              <a href={snap.get("xendit_invoice_url")} className="mt-4 inline-block text-sm text-[var(--accent)] underline underline-offset-4">
                Belum bayar? Buka tagihan lagi
              </a>
            )}
          </>
        )}
        <div className="mt-6 rounded-lg bg-neutral-50 p-4 text-left text-sm">
          <div className="flex justify-between"><span className="text-neutral-500">ID Invoice</span><span className="font-mono font-medium">{orderId}</span></div>
          <div className="mt-1 flex justify-between"><span className="text-neutral-500">Produk</span><span>{snap.get("product_title")}</span></div>
          <div className="mt-1 flex justify-between"><span className="text-neutral-500">Total</span><span>{formatIDR(snap.get("amount"))}</span></div>
        </div>
        {linked ? (
          <p className="mt-4 text-xs text-neutral-500">Pesanan ini tersimpan di akun Anda.</p>
        ) : (
          <p className="mt-4 text-xs text-neutral-500">Simpan ID invoice ini untuk melacak pesanan & klaim garansi.</p>
        )}
        {!signedIn && (
          <Link
            href={link(`/daftar?email=${encodeURIComponent(snap.get("customer_contact.email") ?? "")}`)}
            className="mt-4 block rounded-lg border border-dashed border-neutral-300 px-4 py-3 text-sm hover:bg-neutral-50"
          >
            <b>Buat akun gratis</b> — pesanan ini otomatis masuk riwayat Anda, checkout berikutnya lebih cepat.
          </Link>
        )}
        <div className="mt-6 flex justify-center gap-4 text-sm">
          <Link href={link(linked ? "/akun" : "/track")} className="font-medium underline underline-offset-4">{linked ? "Lihat pesanan saya" : "Lacak pesanan"}</Link>
          <Link href={link("")} className="text-neutral-500 underline underline-offset-4">Kembali ke toko</Link>
        </div>
      </div>
    </main>
  );
}
