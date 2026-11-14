import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/stores";
import { readableOn } from "@/lib/color";

type Params = Promise<{ storeSlug: string }>;

// Dynamic SEO per store (plan-storefront.md §5). The OG image comes from opengraph-image.tsx.
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const store = await getStore((await params).storeSlug);
  if (!store) return { title: "Toko tidak ditemukan" };
  const description = store.storefront_config.tagline || `Beli produk digital di ${store.store_name}. Checkout instan, akun dikirim ke WhatsApp.`;
  return {
    title: { default: store.store_name, template: `%s · ${store.store_name}` },
    description,
    openGraph: { title: store.store_name, description, siteName: store.store_name, type: "website" },
    twitter: { card: "summary_large_image", title: store.store_name, description },
  };
}

export default async function StoreLayout({ children, params }: { children: React.ReactNode; params: Params }) {
  const store = await getStore((await params).storeSlug);
  if (!store) notFound();

  const accent = store.storefront_config.accent_color;
  const style = { "--accent": accent, "--accent-fg": readableOn(accent) } as React.CSSProperties;

  if (!store.is_active) {
    return (
      <main style={style} className="flex min-h-svh flex-col items-center justify-center gap-2 p-6 text-center">
        <h1 className="text-2xl font-semibold">{store.store_name}</h1>
        <p className="text-neutral-500">Toko sedang tutup sementara. Silakan kembali lagi nanti.</p>
      </main>
    );
  }
  return <div style={style}>{children}</div>;
}
