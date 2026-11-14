import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { getStore } from "@/lib/stores";
import { InfoPage, Prose } from "@/features/info/info-page";

type Params = Promise<{ storeSlug: string }>;

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage({ params }: { params: Params }) {
  const store = await getStore((await params).storeSlug);
  if (!store?.store_info.faq.length) notFound();
  return (
    <InfoPage title="Pertanyaan yang sering diajukan">
      <div className="divide-y">
        {store.store_info.faq.map((f, i) => (
          <details key={i} className="group py-3 first:pt-0 last:pb-0" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
              <span className="[overflow-wrap:anywhere]">{f.q}</span>
              <ChevronDown className="mt-0.5 size-4 shrink-0 transition group-open:rotate-180" />
            </summary>
            <div className="mt-2 text-sm">
              <Prose text={f.a} />
            </div>
          </details>
        ))}
      </div>
    </InfoPage>
  );
}
