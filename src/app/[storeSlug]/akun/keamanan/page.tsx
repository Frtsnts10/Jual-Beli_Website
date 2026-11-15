import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { getCustomer } from "@/lib/customer";
import { formatDate } from "@/lib/utils";
import { CancelDeletionButton, ChangeEmailForm, DeletionRequestForm, PasswordReset } from "@/features/account/account-client";
import { Section } from "@/features/account/section";

const iso = (v: unknown) => (v && typeof v === "object" && "toDate" in v ? (v as { toDate(): Date }).toDate().toISOString() : null);

export default async function SecurityPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params;
  const customer = await getCustomer();
  if (!customer) notFound();
  const request = await adminDb.collection("account_deletion_requests").doc(customer.uid).get();
  const pendingSince = request.get("status") === "PENDING" ? (iso(request.get("requested_at")) ?? new Date().toISOString()) : null;
  const rejectedReason = request.get("status") === "REJECTED" ? (request.get("rejected_reason") as string) : null;

  return (
    <div className="grid gap-4">
      {customer.google ? (
        <Section title="Login dengan Google" description={`Akun ini masuk lewat Google (${customer.email}). Password dan email dikelola di akun Google Anda, jadi tidak ada yang perlu diatur di sini.`} />
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
      {pendingSince ? (
        <Section
          title="Pengajuan hapus akun terkirim"
          description={`Diajukan ${formatDate(pendingSince, true)}. Admin memproses dalam maksimal 7 hari; setelah disetujui, Anda otomatis keluar dan tidak bisa masuk lagi dengan akun ini.`}
        >
          <CancelDeletionButton />
        </Section>
      ) : (
        <Section
          title="Hapus akun"
          description="Ajukan penghapusan login dan profil Anda di semua toko; admin memprosesnya dalam maksimal 7 hari. Riwayat pesanan tetap disimpan penjual untuk keperluan garansi, tapi tidak lagi terhubung ke akun Anda. Ulasan Anda tetap tampil sebagai “Pembeli”."
        >
          <DeletionRequestForm storeKey={storeSlug} rejectedReason={rejectedReason} />
        </Section>
      )}
    </div>
  );
}
