import { getProducts } from "@/features/products/api";
import { getCarouselSlides } from "@/features/carousel/api";
import { getStore } from "@/features/stores/api";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductGroup } from "@/components/product-group";
import { ShieldCheck, Zap } from "lucide-react";

// Inventory stock and the hero carousel change without a redeploy, so this
// page must read fresh data on every request rather than being frozen at build time.
export const dynamic = "force-dynamic";

const PAYMENT_METHODS = ["QRIS", "GoPay", "OVO", "Dana"];

export default async function HomePage() {
  const [products, slides, store] = await Promise.all([
    getProducts(),
    getCarouselSlides(),
    getStore(),
  ]);

  const storeName = store?.name || "STORE";

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    let groupKey = product.category || "Other Essentials";
    groupKey = groupKey.charAt(0).toUpperCase() + groupKey.slice(1);

    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  const groupKeys = Object.keys(groupedProducts);

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground">
      <HeroCarousel slides={slides} />

      {/* Trust / payment row */}
      <div className="max-w-7xl mx-auto px-6 lg:px-16 w-full mb-2">
        <div className="bg-white border border-stone-200 rounded-2xl px-7 py-5 flex flex-wrap items-center gap-x-8 gap-y-4 justify-between">
          <div className="flex items-center gap-2.5 text-[13px] font-bold text-stone-700">
            <ShieldCheck className="w-[18px] h-[18px] text-blue-600" />
            Verified Sellers
          </div>
          <div className="hidden sm:block w-px h-5 bg-stone-200" />
          <div className="flex items-center gap-2.5 text-[13px] font-bold text-stone-700">
            <Zap className="w-[18px] h-[18px] text-blue-600" />
            Instant Delivery
          </div>
          <div className="hidden sm:block w-px h-5 bg-stone-200" />
          <div className="flex items-center gap-3.5">
            <span className="text-[11px] font-bold text-stone-400">PAY WITH</span>
            <div className="flex gap-2">
              {PAYMENT_METHODS.map((method) => (
                <span key={method} className="px-3 py-1.5 rounded-lg bg-stone-100 text-[11.5px] font-extrabold text-stone-700">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8">
        {groupKeys.length > 0 ? (
          groupKeys.map((key) => (
            <ProductGroup
              key={key}
              categoryId={key}
              title={`${key} Services`}
              description={`Browse our premium ${key} accounts and subscriptions.`}
              products={groupedProducts[key].slice(0, 12)}
            />
          ))
        ) : (
          <div className="text-center py-20 text-stone-400">
            No products found in the database.
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200 px-6 py-10 text-center text-stone-400 text-sm">
        <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
