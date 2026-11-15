import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStore, storeLinker, type PublicStore } from "@/lib/stores";
import { StoreFooter, StoreNav, WhatsAppButton, type ChromeVariant, type NavLink } from "@/components/store-chrome";
import { readableOn } from "@/lib/color";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { getCustomer } from "@/lib/customer";
import { navControl } from "@/lib/ui";

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

/** Info pages exist only when the seller filled them in (dashboard → Pengaturan → Info toko). */
function infoLinks(store: PublicStore, link: (path: string) => string): NavLink[] {
  const { about, faq, warranty_policy } = store.store_info;
  return [
    ...(about ? [{ href: link("/tentang"), label: "Tentang" }] : []),
    ...(faq.length ? [{ href: link("/faq"), label: "FAQ" }] : []),
    ...(warranty_policy ? [{ href: link("/garansi"), label: "Garansi" }] : []),
  ];
}

export default async function StoreLayout({ children, params }: { children: React.ReactNode; params: Params }) {
  const { storeSlug } = await params;
  const store = await getStore(storeSlug);
  if (!store) notFound();
  const link = await storeLinker(storeSlug);

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
  const variant: ChromeVariant = store.template === "template_e_brutalist" ? "brutalist" : "clean";
  const info = infoLinks(store, link);
  const track = { href: link("/track"), label: "Lacak pesanan" };
  const customer = await getCustomer();
  const account = customer ? (
    <Link href={link("/akun")} className={`${navControl} border border-current/15 px-3`}>
      <UserRound className="size-4" />
      <span className="max-w-24 truncate">{customer.name.split(" ")[0] || "Akun"}</span>
    </Link>
  ) : (
    <Link href={link("/masuk")} className={`${navControl} bg-[var(--accent)] px-4 font-semibold text-[var(--accent-fg)]`}>
      Masuk
    </Link>
  );
  return (
    <div style={style} className="flex min-h-svh flex-col">
      <StoreNav
        storeName={store.store_name}
        logoUrl={store.storefront_config.logo_url}
        homeHref={link("")}
        links={[{ href: `${link("")}#produk`, label: "Produk" }, track, ...info]}
        variant={variant}
        actions={account}
      />
      {/* Phones: keep the end of every page clear of the floating chat button. */}
      <div className={store.store_info.whatsapp ? "flex-1 pb-16 sm:pb-0" : "flex-1"}>{children}</div>
      <StoreFooter storeName={store.store_name} links={[track, ...info]} variant={variant} chatButton={!!store.store_info.whatsapp} />
      {store.store_info.whatsapp && <WhatsAppButton phone={store.store_info.whatsapp} storeName={store.store_name} />}
    </div>
  );
}
