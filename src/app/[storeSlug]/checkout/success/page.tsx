import { notFound, redirect } from "next/navigation";
import { storeLinker } from "@/lib/stores";
import { ORDER_ID_RE } from "@/lib/order-id";

// Older links (and bots) point here; the pay page shows every payment state now.
export default async function CheckoutSuccessPage({ params, searchParams }: { params: Promise<{ storeSlug: string }>; searchParams: Promise<{ order?: string }> }) {
  const [{ storeSlug }, { order }] = await Promise.all([params, searchParams]);
  if (!order || !ORDER_ID_RE.test(order)) notFound();
  redirect((await storeLinker(storeSlug))(`/bayar/${order}`));
}
