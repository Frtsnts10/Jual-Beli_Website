import { notFound } from "next/navigation";
import { getCustomer } from "@/lib/customer";
import { ProfileForm } from "@/features/account/account-client";
import { Section } from "@/features/account/section";

export default async function ProfilePage() {
  const customer = await getCustomer();
  if (!customer) notFound();
  return (
    <div className="grid gap-4">
      <Section title="Profil" description="Berlaku di semua toko di platform ini.">
        <ProfileForm name={customer.name} phone={customer.phone} />
      </Section>
      <Section title="Email">
        <p className="text-sm">
          {customer.email}{" "}
          <span className={customer.email_verified ? "text-emerald-700" : "text-amber-700"}>· {customer.email_verified ? "terverifikasi" : "belum diverifikasi"}</span>
        </p>
        <p className="mt-1 text-xs text-neutral-500">Ganti email di tab Keamanan.</p>
      </Section>
    </div>
  );
}
