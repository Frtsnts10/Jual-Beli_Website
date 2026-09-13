"use client";

import { Product } from "@/types/schema";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ProductGroupProps {
  title: string;
  categoryId: string;
  description?: string;
  products: Product[];
}

function formatPrice(price: number, currency: string) {
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString()}`;
  }
}

export function ProductGroup({ title, categoryId, description, products }: ProductGroupProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-stone-900">{title}</h2>
            {description && <p className="text-stone-500 text-sm mt-1">{description}</p>}
          </div>
          <Link href={`/products?category=${encodeURIComponent(categoryId)}`} className="text-[13.5px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.map((product) => {
            const inStock = product.stock > 0;
            return (
              <Link
                href={`/product/${product.slug}`}
                key={product.id}
                className="group flex flex-col bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-[0_16px_32px_-12px_rgba(28,25,23,0.12)] hover:-translate-y-0.5 transition-all"
              >
                <div className="relative aspect-square overflow-hidden bg-stone-100">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3.5 flex flex-col flex-1">
                  <span
                    className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-md mb-2 ${
                      inStock ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                    }`}
                  >
                    {inStock ? "In Stock" : "Out of Stock"}
                  </span>
                  <h3 className="text-[13.5px] font-bold text-stone-900 mb-1 line-clamp-1">{product.name}</h3>
                  <span className="mt-auto text-[15px] font-extrabold text-stone-900">
                    {formatPrice(product.price, product.currency)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
