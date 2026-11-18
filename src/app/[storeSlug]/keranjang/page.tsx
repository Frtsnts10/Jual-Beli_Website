import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPublishedProducts, getStore, storeLinker } from "@/lib/stores";
import { priceFor } from "@/lib/pricing";
import { getCustomer } from "@/lib/customer";
import { CartView } from "@/features/cart/cart-view";

export const metadata = { title: "Keranjang", robots: { index: false } };

export default async function CartPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params;
  const store = await getStore(storeSlug);
  if (!store) notFound();
  const link = await storeLinker(storeSlug);
  const [products, customer] = await Promise.all([getPublishedProducts(store.id), getCustomer()]);

  return (
    <main className="t-page min-h-[calc(100svh-3.5rem)] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <Link href={link("/")} className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900">
          <ArrowLeft className="size-4" /> Lanjut belanja
        </Link>
        <h1 className="t-heading mb-4 text-2xl font-semibold">Keranjang</h1>
        <CartView
          storeId={store.id}
          storeKey={storeSlug}
          products={products.map((p) => ({
            id: p.id,
            title: p.title,
            image_url: p.image_url,
            duration_days: p.duration_days,
            bundle_titles: p.bundle_titles,
            stock: p.stock_available,
            price: priceFor(p, store.features).price,
            original: priceFor(p, store.features).original,
            href: link(`/p/${p.id}`),
          }))}
          buyer={customer && { email: customer.email, phone: customer.phone }}
          signInHref={link(`/masuk?next=${encodeURIComponent(link("/keranjang"))}`)}
          shopHref={link("/")}
          vouchers={store.features.vouchers}
          canPay={!!store.payment}
        />
      </div>
    </main>
  );
}
