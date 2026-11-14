import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/stores";
import { InfoPage, Prose } from "@/features/info/info-page";

type Params = Promise<{ storeSlug: string }>;

export const metadata: Metadata = { title: "Tentang" };

export default async function AboutPage({ params }: { params: Params }) {
  const store = await getStore((await params).storeSlug);
  if (!store?.store_info.about) notFound();
  return (
    <InfoPage title={`Tentang ${store.store_name}`}>
      <Prose text={store.store_info.about} />
    </InfoPage>
  );
}
