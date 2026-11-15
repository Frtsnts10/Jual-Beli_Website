import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore, storeLinker } from "@/lib/stores";
import { InfoPage, Prose } from "@/features/info/info-page";
import { btnPrimary } from "@/lib/ui";

type Params = Promise<{ storeSlug: string }>;

export const metadata: Metadata = { title: "Kebijakan garansi" };

export default async function WarrantyPage({ params }: { params: Params }) {
  const { storeSlug } = await params;
  const store = await getStore(storeSlug);
  if (!store?.store_info.warranty_policy) notFound();
  const link = await storeLinker(storeSlug);
  return (
    <InfoPage title="Kebijakan garansi">
      <Prose text={store.store_info.warranty_policy} />
      <Link
        href={link("/track")}
        className={`${btnPrimary} mt-6`}
      >
        Klaim garansi
      </Link>
    </InfoPage>
  );
}
