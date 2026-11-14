import type { Metadata } from "next";
import { requireCustomer } from "@/lib/customer";
import { storeLinker } from "@/lib/stores";
import { AccountTabs, SignOutButton, VerifyEmailBanner } from "@/features/account/account-client";

export const metadata: Metadata = { title: "Akun saya", robots: { index: false } };

export default async function AccountLayout({ children, params }: { children: React.ReactNode; params: Promise<{ storeSlug: string }> }) {
  const link = await storeLinker((await params).storeSlug);
  const customer = await requireCustomer(link(`/masuk?next=${encodeURIComponent(link("/akun"))}`));
  return (
    <main className="min-h-[calc(100svh-3.5rem)] bg-neutral-50 px-4 py-8 sm:py-12">
      <div className="mx-auto grid max-w-3xl gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">Halo, {customer.name.split(" ")[0] || "Pembeli"}</h1>
            <p className="truncate text-sm text-neutral-500">{customer.email}</p>
          </div>
          <SignOutButton homeHref={link("")} />
        </div>
        {!customer.email_verified && <VerifyEmailBanner />}
        <AccountTabs
          tabs={[
            { href: link("/akun"), label: "Pesanan" },
            { href: link("/akun/profil"), label: "Profil" },
            { href: link("/akun/keamanan"), label: "Keamanan" },
          ]}
        />
        {children}
      </div>
    </main>
  );
}
