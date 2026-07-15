import { getProducts } from "@/features/products/api";
import { Button } from "@heroui/react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default async function ProductsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const categoryParam = typeof searchParams.category === 'string' ? searchParams.category : undefined;

  let products = await getProducts();

  if (categoryParam) {
    products = products.filter(product => {
      let groupKey = product.category || "Other Essentials";
      groupKey = groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
      return groupKey === categoryParam;
    });
  }

  return (
    <div className="flex-1 flex flex-col">

      <main className="flex-1 px-6 py-32 max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {categoryParam ? `${categoryParam} Services` : "All Products"}
          </h1>
          <p className="text-neutral-400 text-lg">
            {categoryParam 
              ? `Browse our premium ${categoryParam} accounts and subscriptions.`
              : "Browse our complete collection of premium essentials."
            }
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link href={`/product/${product.slug}`} key={product.id} className="group flex flex-col rounded-2xl bg-neutral-900/50 border border-neutral-800 overflow-hidden hover:border-neutral-700 hover:bg-neutral-900 transition-all">
              <div className="relative aspect-[4/5] overflow-hidden bg-neutral-800">
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold mb-1 group-hover:text-blue-400 transition-colors">{product.name}</h3>
                <div className="flex items-center justify-between mt-auto pt-4">
                  <span className="font-medium">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(product.price)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-neutral-800 px-6 py-8 text-center text-neutral-500 text-sm mt-12">
        <p>&copy; {new Date().getFullYear()} STORE. All rights reserved.</p>
      </footer>
    </div>
  );
}
