/* eslint-disable @next/next/no-img-element -- static logo */
import { QrCode, ShieldCheck, MessageCircle } from "lucide-react";

// NEXT_PUBLIC_DASHBOARD_URL wins; otherwise the dashboard lives at jual.<ROOT_DOMAIN>.
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim().toLowerCase();
const DASHBOARD_URL = (process.env.NEXT_PUBLIC_DASHBOARD_URL || (ROOT_DOMAIN ? `https://jual.${ROOT_DOMAIN}` : ""))?.replace(/\/+$/, "") || undefined;
// Sellers land straight on the dashboard's sign-up form.
const SIGN_UP_URL = DASHBOARD_URL ? `${DASHBOARD_URL}/sign-up` : "#";

export default function PlatformLanding() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center px-6 py-20">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="" width={56} height={40} className="h-10 w-auto" />
        <span className="text-2xl font-bold tracking-tight">Jual</span>
      </div>
      <h1 className="mt-8 text-4xl font-bold tracking-tight md:text-5xl">
        Buka toko digital, <span className="text-[#0B5CE5]">terima QRIS</span>, <span className="text-[#FF6F0F]">kirim otomatis</span>.
      </h1>
      <p className="mt-4 text-lg text-neutral-600">
        Etalase siap pakai di <b className="text-neutral-900">namatoko.belidi.biz.id</b>. Pembeli bayar QRIS ke rekening Anda sendiri, akun premium dikirim ke WhatsApp
        mereka.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: QrCode, text: "Keranjang & satu kali bayar QRIS" },
          { icon: MessageCircle, text: "Akun dikirim ke WhatsApp" },
          { icon: ShieldCheck, text: "Portal garansi & lacak pesanan" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="rounded-sm border p-4 text-sm">
            <Icon className="mb-2 size-5 text-[#0B5CE5]" />
            {text}
          </div>
        ))}
      </div>
      <a href={SIGN_UP_URL} className="mt-10 w-fit rounded-sm bg-[#FF6F0F] px-5 py-3 text-sm font-medium text-white hover:bg-[#e8620a]">
        Buka toko Anda gratis →
      </a>
    </main>
  );
}
