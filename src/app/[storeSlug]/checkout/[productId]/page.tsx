import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import { getPublishedProduct, getStore, storeLinker } from "@/lib/stores";
import { formatIDR } from "@/lib/utils";
import { ProductImage } from "@/components/templates/product-image";
import { CheckoutForm } from "@/features/checkout/checkout-form";
import { Countdown } from "@/components/countdown";
import { priceFor } from "@/lib/pricing";
import { getCustomer } from "@/lib/customer";

type Params = Promise<{ storeSlug: string; productId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { storeSlug, productId } = await params;
  const store = await getStore(storeSlug);
  const product = store && (await getPublishedProduct(store.id, productId));
  return product ? { title: product.title, description: product.description || `Beli ${product.title} — ${formatIDR(product.price)}` } : {};
}

// No cart: "Beli Langsung" lands here, the buyer enters email + WhatsApp and pays.
export default async function CheckoutPage({ params }: { params: Params }) {
  const { storeSlug, productId } = await params;
  const store = await getStore(storeSlug);
  if (!store) notFound();
  const product = await getPublishedProduct(store.id, productId);
  if (!product) notFound();
  const link = await storeLinker(storeSlug);
  const sale = priceFor(product, store.tier);
  const customer = await getCustomer();

  return (
    <main className="min-h-[calc(100svh-3.5rem)] bg-neutral-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link href={link("/")} className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900">
          <ArrowLeft className="size-4" /> {store.store_name}
        </Link>
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex gap-4 border-b p-5">
            <ProductImage src={product.image_url} alt={product.title} className="size-20 shrink-0 rounded-xl" />
            <div className="min-w-0">
              <p className="text-xs text-neutral-500">{product.platform_type} · {product.duration_days} hari</p>
              <h1 className="font-semibold">{product.title}</h1>
              {product.bundle_titles && <p className="text-xs text-neutral-500">Paket: {product.bundle_titles.join(" + ")}</p>}
              <p className="mt-1 text-xl font-bold">
                {sale.original && <span className="mr-2 text-sm font-normal text-neutral-400 line-through">{formatIDR(sale.original)}</span>}
                {formatIDR(sale.price)}
              </p>
              {sale.endsAt && <Countdown endsAt={sale.endsAt} className="text-xs font-semibold text-red-500" />}
            </div>
          </div>
          {product.description && <p className="border-b px-5 py-4 text-sm whitespace-pre-line text-neutral-600">{product.description}</p>}
          <div className="p-5">
            <CheckoutForm
              storeKey={storeSlug}
              productId={product.id}
              soldOut={product.stock_available < 1}
              buyer={customer && { email: customer.email, phone: customer.phone, lastChannel: customer.last_channel }}
              signInHref={link(`/masuk?next=${encodeURIComponent(link(`/checkout/${product.id}`))}`)}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-6 text-xs text-neutral-500">
          <span className="flex items-center gap-1"><Zap className="size-3.5" /> Pengiriman otomatis</span>
          <span className="flex items-center gap-1"><ShieldCheck className="size-3.5" /> Bergaransi</span>
        </div>
      </div>
    </main>
  );
}
