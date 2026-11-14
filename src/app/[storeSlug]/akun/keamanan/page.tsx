import { notFound } from "next/navigation";
import { getCustomer } from "@/lib/customer";
import { storeLinker } from "@/lib/stores";
import { ChangeEmailForm, DeleteAccountForm, PasswordReset } from "@/features/account/account-client";
import { Section } from "@/features/account/section";

export default async function SecurityPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const [customer, link] = await Promise.all([getCustomer(), storeLinker((await params).storeSlug)]);
  if (!customer) notFound();
  return (
    <div className="grid gap-4">
      {customer.google ? (
        <Section title="Login dengan Google" description={`Akun ini masuk lewat Google (${customer.email}). Password dan email dikelola di akun Google Anda.`}>
          <span className="text-sm text-neutral-500">Tidak ada yang perlu diatur di sini.</span>
        </Section>
      ) : (
        <>
          <Section title="Password" description="Kami kirim link untuk membuat password baru ke email Anda.">
            <PasswordReset email={customer.email} />
          </Section>
          <Section title="Ganti email" description="Untuk keamanan, masukkan password Anda. Email baru aktif setelah Anda mengklik link konfirmasi.">
            <ChangeEmailForm email={customer.email} />
          </Section>
        </>
      )}
      <Section title="Hapus akun">
        <DeleteAccountForm homeHref={link("")} />
      </Section>
    </div>
  );
}
