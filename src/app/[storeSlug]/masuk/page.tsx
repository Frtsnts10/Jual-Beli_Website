import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStore, storeLinker } from "@/lib/stores";
import { getCustomer } from "@/lib/customer";
import { AuthShell } from "@/features/account/auth-shell";
import { SignInForm } from "@/features/account/auth-forms";
import { DEMO_STORE_ID } from "@/lib/demo-pay";

export const metadata: Metadata = { title: "Masuk", robots: { index: false } };

export default async function SignInPage({ params, searchParams }: { params: Promise<{ storeSlug: string }>; searchParams: Promise<{ next?: string }> }) {
  const { storeSlug } = await params;
  const { next = "" } = await searchParams;
  const [store, link] = await Promise.all([getStore(storeSlug), storeLinker(storeSlug)]);
  if (await getCustomer()) redirect(link("/akun"));
  const q = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <AuthShell title="Masuk" subtitle={`Lihat pesanan, klaim garansi dan checkout lebih cepat di ${store?.store_name ?? "toko ini"}.`}>
      <SignInForm
        next={next}
        accountHref={link("/akun")}
        signUpHref={link(`/daftar${q}`)}
        forgotHref={link("/lupa-password")}
        demoStoreKey={store?.id === DEMO_STORE_ID ? storeSlug : undefined}
      />
    </AuthShell>
  );
}
