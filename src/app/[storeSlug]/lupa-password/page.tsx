import type { Metadata } from "next";
import { storeLinker } from "@/lib/stores";
import { AuthShell } from "@/features/account/auth-shell";
import { ForgotPasswordForm } from "@/features/account/auth-forms";

export const metadata: Metadata = { title: "Lupa password", robots: { index: false } };

export default async function ForgotPasswordPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const link = await storeLinker((await params).storeSlug);
  return (
    <AuthShell title="Lupa password" subtitle="Kami kirim link untuk membuat password baru ke email Anda.">
      <ForgotPasswordForm signInHref={link("/masuk")} />
    </AuthShell>
  );
}
