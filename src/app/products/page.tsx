import { getProducts } from "@/features/products/api";
import Link from "next/link";

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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-stone-900">
            {categoryParam ? `${categoryParam} Services` : "All Products"}
          </h1>
          <p className="text-stone-500 text-lg">
            {categoryParam
              ? `Browse our premium ${categoryParam} accounts and subscriptions.`
              : "Browse our complete collection of premium essentials."
            }
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.map((product) => (
            <Link href={`/product/${product.slug}`} key={product.id} className="group flex flex-col bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-[0_16px_32px_-12px_rgba(28,25,23,0.12)] hover:-translate-y-0.5 transition-all">
              <div className="relative aspect-square overflow-hidden bg-stone-100">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3.5 flex flex-col flex-1">
                <h3 className="text-[13.5px] font-bold text-stone-900 mb-1 line-clamp-1">{product.name}</h3>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[15px] font-extrabold text-stone-900">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(product.price)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-stone-200 px-6 py-8 text-center text-stone-400 text-sm mt-12">
        <p>&copy; {new Date().getFullYear()} STORE. All rights reserved.</p>
      </footer>
    </div>
  );
}
