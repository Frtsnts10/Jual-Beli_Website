import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { storeLinker } from "@/lib/stores";
import { getCustomer } from "@/lib/customer";
import { AuthShell } from "@/features/account/auth-shell";
import { SignUpForm } from "@/features/account/auth-forms";

export const metadata: Metadata = { title: "Daftar", robots: { index: false } };

export default async function SignUpPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ next?: string; email?: string }>;
}) {
  const { storeSlug } = await params;
  const { next = "", email } = await searchParams;
  const link = await storeLinker(storeSlug);
  if (await getCustomer()) redirect(link("/akun"));
  const q = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <AuthShell title="Buat akun" subtitle="Satu akun untuk semua toko di platform ini. Pesanan lama dengan email yang sama ikut tampil setelah email diverifikasi.">
      <SignUpForm next={next} accountHref={link("/akun")} signInHref={link(`/masuk${q}`)} email={email} />
    </AuthShell>
  );
}
