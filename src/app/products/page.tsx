import { getProductsAction } from "@/features/products/actions/product-actions";
import { ProductGrid } from "@/features/products/components/product-grid";
import { Chip } from "@heroui/react";

export default async function ProductsPage() {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!;
  const products = await getProductsAction(storeId);
  const currency = "Rp"; // could be fetched from store but hardcoded for now or we could fetch store as well

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-12">
        <Chip variant="soft" size="sm" className="mb-3 font-bold tracking-widest uppercase text-[10px] border-none text-secondary">
          Catalog
        </Chip>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">All Products</h1>
        <p className="text-default-500 text-xs mt-3 uppercase tracking-wider font-bold max-w-2xl">
          Browse our entire inventory of premium digital goods and services.
        </p>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-20 text-default-500">
          No products available at the moment.
        </div>
      ) : (
        <ProductGrid products={products} currency={currency} />
      )}
    </div>
  );
}
