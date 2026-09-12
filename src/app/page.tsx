import { getProducts } from "@/features/products/api";
import { getCarouselSlides } from "@/features/carousel/api";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductGroup } from "@/components/product-group";

// Inventory stock and the hero carousel change without a redeploy, so this
// page must read fresh data on every request rather than being frozen at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, slides] = await Promise.all([
    getProducts(),
    getCarouselSlides(),
  ]);

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

      <main className="flex-1 -mt-10 relative z-20">
        <div className="bg-background rounded-t-[3rem] pt-10 pb-20 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
          {groupKeys.length > 0 ? (
            groupKeys.map((key) => (
              <ProductGroup 
                key={key} 
                categoryId={key}
                title={`${key} Services`} 
                description={`Browse our premium ${key} accounts and subscriptions.`}
                products={groupedProducts[key].slice(0, 4)} 
              />
            ))
          ) : (
            <div className="text-center py-20 text-neutral-500">
              No products found in the database.
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-12 text-center text-neutral-500 text-sm bg-neutral-950">
        <p>&copy; {new Date().getFullYear()} STORE. All rights reserved.</p>
      </footer>
    </div>
  );
}
