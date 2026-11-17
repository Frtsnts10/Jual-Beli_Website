import type { Metadata } from "next";
import Link from "next/link";
import { AddToCart } from "@/features/cart/cart-buttons";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ShieldCheck, Zap } from "lucide-react";
import { getPublishedProduct, getStore, storeLinker } from "@/lib/stores";
import { getProductReviews } from "@/lib/reviews";
import { ratingSummary, STARS } from "@/lib/rating";
import { priceFor } from "@/lib/pricing";
import { formatDate, formatIDR } from "@/lib/utils";
import { requestStore } from "@/lib/request-store";
import { ProductImage } from "@/components/templates/product-image";
import { Countdown } from "@/components/countdown";
import { Stars } from "@/components/stars";
import { RestockForm } from "@/features/restock/restock-form";
import { getCustomer } from "@/lib/customer";
import { btnMuted, btnOutline, btnPrimary } from "@/lib/ui";

type Params = Promise<{ storeSlug: string; productId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { storeSlug, productId } = await params;
  const store = await getStore(storeSlug);
  const product = store && (await getPublishedProduct(store.id, productId));
  if (!store || !product) return {};
  const description = (product.description || `Beli ${product.title} di ${store.store_name}. Pengiriman otomatis & bergaransi.`).slice(0, 160);
  return {
    title: product.title,
    description,
    openGraph: { title: product.title, description, images: product.image_url ? [product.image_url] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { storeSlug, productId } = await params;
  const store = await getStore(storeSlug);
  if (!store) notFound();
  const product = await getPublishedProduct(store.id, productId);
  if (!product) notFound();
  const [link, reviews, { origin }, customer] = await Promise.all([
    storeLinker(storeSlug),
    getProductReviews(store.id, product.id),
    requestStore(),
    getCustomer(),
  ]);
  const sale = priceFor(product, store.tier);
  const rating = ratingSummary(product.rating);
  const soldOut = product.stock_available < 1 || !store.is_active;
  const policy = store.store_info.warranty_policy;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || undefined,
    image: product.image_url || undefined,
    brand: { "@type": "Brand", name: store.store_name },
    offers: {
      "@type": "Offer",
      price: sale.price,
      priceCurrency: "IDR",
      availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${origin}${link(`/p/${product.id}`)}`,
    },
    ...(rating.count ? { aggregateRating: { "@type": "AggregateRating", ratingValue: rating.avg, reviewCount: rating.count } } : {}),
  };

  return (
    <main className="t-page min-h-[calc(100svh-3.5rem)] px-4 py-8 sm:py-12">
      {/* JSON.stringify output can't close the script tag once "<" is escaped. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="mx-auto max-w-5xl">
        <Link href={`${link("")}#produk`} className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900">
          <ArrowLeft className="size-4" /> Semua produk
        </Link>

        <div className="grid gap-6 md:grid-cols-2 md:gap-10">
          <div className="relative">
            <ProductImage src={product.image_url} alt={product.title} className="t-media aspect-square w-full" />
            {product.is_flash_sale && sale.original && (
              <span className="absolute top-3 left-3 rounded bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">FLASH SALE</span>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <div>
              <p className="text-sm text-neutral-500">{product.platform_type}</p>
              <h1 className="t-heading text-2xl font-bold tracking-tight [overflow-wrap:anywhere] sm:text-3xl">{product.title}</h1>
              {rating.count > 0 && (
                <a href="#ulasan" className="mt-2 inline-flex items-center gap-2 text-sm text-neutral-600 hover:underline">
                  <Stars value={rating.avg} /> <b className="text-neutral-900">{rating.avg.toFixed(1)}</b> · {rating.count} ulasan
                </a>
              )}
            </div>

            <div>
              <p className="text-3xl font-bold">
                {sale.original && <span className="mr-2 text-base font-normal text-neutral-400 line-through">{formatIDR(sale.original)}</span>}
                {formatIDR(sale.price)}
              </p>
              {sale.endsAt && <Countdown endsAt={sale.endsAt} className="text-sm font-semibold text-red-500" />}
            </div>

            <ul className="grid gap-2 text-sm text-neutral-700">
              <li className="flex items-center gap-2"><Clock className="size-4 text-neutral-400" /> Masa aktif {product.duration_days} hari</li>
              <li className="flex items-center gap-2"><Zap className="size-4 text-neutral-400" /> Dikirim otomatis ke WhatsApp setelah bayar</li>
              <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-neutral-400" /> Bergaransi selama masa aktif</li>
            </ul>

            {product.bundle_titles && (
              <div className="t-card p-4 text-sm">
                <p className="mb-2 font-medium">Isi paket</p>
                <ul className="list-inside list-disc text-neutral-600">
                  {product.bundle_titles.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}

            {!store.is_active ? (
              <span className={`${btnMuted} w-full`}>Toko sedang tutup</span>
            ) : soldOut ? (
              <RestockForm storeKey={storeSlug} productId={product.id} phone={customer?.phone} />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <AddToCart storeId={store.id} productId={product.id} className={btnOutline} />
                <Link href={link(`/checkout/${product.id}`)} className={btnPrimary}>
                  Beli sekarang
                </Link>
              </div>
            )}
            {!soldOut && product.stock_available <= 3 && <p className="-mt-2 text-center text-xs text-amber-600">Sisa {product.stock_available} lagi</p>}

            {product.description && (
              <section>
                <h2 className="t-heading mb-1 font-semibold">Deskripsi</h2>
                <p className="text-sm leading-relaxed whitespace-pre-line text-neutral-700 [overflow-wrap:anywhere]">{product.description}</p>
              </section>
            )}
            {policy && (
              <section>
                <h2 className="t-heading mb-1 font-semibold">Garansi</h2>
                <p className="line-clamp-4 text-sm leading-relaxed whitespace-pre-line text-neutral-700 [overflow-wrap:anywhere]">{policy}</p>
                <Link href={link("/garansi")} className="mt-1 inline-block text-sm font-medium underline underline-offset-4">
                  Baca kebijakan lengkap
                </Link>
              </section>
            )}
          </div>
        </div>

        <section id="ulasan" className="mt-12 scroll-mt-20">
          <h2 className="t-heading mb-4 text-xl font-semibold">Ulasan pembeli</h2>
          {rating.count === 0 ? (
            <p className="t-card-dashed p-8 text-center text-sm text-neutral-500">
              Belum ada ulasan. Pembeli bisa menulis ulasan dari halaman Akun setelah pesanan lunas.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
              <div className="h-fit t-card p-5">
                <p className="text-4xl font-bold">{rating.avg.toFixed(1)}</p>
                <Stars value={rating.avg} className="mt-1" />
                <p className="mt-1 text-sm text-neutral-500">{rating.count} ulasan</p>
                <div className="mt-4 grid gap-1.5">
                  {STARS.map((k) => (
                    <div key={k} className="flex items-center gap-2 text-xs text-neutral-600">
                      <span className="w-3">{k}</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                        <span className="block h-full rounded-full bg-amber-400" style={{ width: `${(product.rating[k] / rating.count) * 100}%` }} />
                      </span>
                      <span className="w-6 text-right tabular-nums">{product.rating[k]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ul className="grid h-fit gap-3">
                {reviews.map((r) => (
                  <li key={r.id} className="t-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <Stars value={r.rating} />
                        <b className="text-sm">{r.name}</b>
                      </span>
                      {r.created_at && <span className="text-xs text-neutral-400">{formatDate(r.created_at)}</span>}
                    </div>
                    {r.text && <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-neutral-700 [overflow-wrap:anywhere]">{r.text}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
