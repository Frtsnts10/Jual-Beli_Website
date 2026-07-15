"use client";

import { Product } from "@/types/schema";
import { Button } from "@heroui/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ProductGroupProps {
  title: string;
  categoryId: string;
  description?: string;
  products: Product[];
}

export function ProductGroup({ title, categoryId, description, products }: ProductGroupProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">{title}</h2>
            {description && <p className="text-neutral-400">{description}</p>}
          </div>
          <Link href={`/products?category=${encodeURIComponent(categoryId)}`} className="text-blue-500 hover:text-blue-400 font-medium flex items-center transition-colors">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link href={`/product/${product.slug}`} key={product.id} className="group flex flex-col rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-colors">
              <div className="relative aspect-square overflow-hidden bg-neutral-800">
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-base mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">{product.name}</h3>
                <p className="text-neutral-400 text-xs mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-medium text-white">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(product.price)}
                  </span>
                  <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full font-medium">
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
