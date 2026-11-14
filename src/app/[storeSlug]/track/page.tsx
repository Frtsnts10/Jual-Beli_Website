import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getStore, storeLinker } from "@/lib/stores";
import { TrackPortal } from "@/features/track/track-portal";

export const metadata = { title: "Lacak pesanan & garansi" };

export default async function TrackPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params;
  const store = await getStore(storeSlug);
  if (!store) notFound();
  const link = await storeLinker(storeSlug);

  return (
    <main className="min-h-[calc(100svh-3.5rem)] bg-neutral-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link href={link("/")} className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900">
          <ArrowLeft className="size-4" /> {store.store_name}
        </Link>
        <h1 className="text-2xl font-semibold">Lacak pesanan</h1>
        <p className="mt-1 mb-6 text-sm text-neutral-500">Masukkan ID invoice dan email untuk melihat status, masa aktif dan klaim garansi.</p>
        <TrackPortal storeKey={storeSlug} />
      </div>
    </main>
  );
}
