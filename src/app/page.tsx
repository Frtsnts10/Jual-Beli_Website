import { Zap, ShieldCheck, MessageCircle } from "lucide-react";

// NEXT_PUBLIC_DASHBOARD_URL wins; otherwise the dashboard lives at jual.<ROOT_DOMAIN>.
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim().toLowerCase();
const DASHBOARD_URL = (process.env.NEXT_PUBLIC_DASHBOARD_URL || (ROOT_DOMAIN ? `https://jual.${ROOT_DOMAIN}` : ""))?.replace(/\/+$/, "") || undefined;
// Sellers land straight on the dashboard's sign-up form.
const SIGN_UP_URL = DASHBOARD_URL ? `${DASHBOARD_URL}/sign-up` : "#";

export default function PlatformLanding() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center px-6 py-20">
      <p className="text-sm font-medium text-emerald-600">Toko Digital</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Etalase akun premium dengan checkout 2 langkah.</h1>
      <p className="mt-4 text-lg text-neutral-600">
        Pembeli cukup isi email dan nomor WhatsApp, bayar QRIS atau e-wallet, akun dikirim otomatis.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Zap, text: "Tanpa keranjang, langsung bayar" },
          { icon: MessageCircle, text: "Akun dikirim ke WhatsApp" },
          { icon: ShieldCheck, text: "Portal garansi & lacak pesanan" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="rounded-sm border p-4 text-sm">
            <Icon className="mb-2 size-5 text-emerald-600" />
            {text}
          </div>
        ))}
      </div>
      <a href={SIGN_UP_URL} className="mt-10 w-fit rounded-sm bg-neutral-900 px-5 py-3 text-sm font-medium text-white">
        Buka toko Anda gratis →
      </a>
    </main>
  );
}
