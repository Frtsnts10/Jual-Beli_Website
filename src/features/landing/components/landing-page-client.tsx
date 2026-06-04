"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@/features/products/actions/product-actions";
import { ProductGrid } from "@/features/products/components/product-grid";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "./hero";
import { Stats } from "./stats";
import { Features } from "./features";
import { Reviews } from "./reviews";
import { Button, Chip } from "@heroui/react";

interface LandingPageClientProps {
  products: Product[];
  store: any;
  user: any;
  stats: any;
}

export function LandingPageClient({ products, store, user, stats }: LandingPageClientProps) {
  const storeName = store?.name || "Premium Storefront";
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const uniqueCategories = useMemo(() => {
    const cats = products.map((p) => p.category).filter(Boolean);
    return Array.from(new Set(cats)) as string[];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const currency = store?.currency === "USD" ? "$" : (store?.currency === "IDR" ? "Rp" : (store?.currency || "Rp"));

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Subtle radial ambient glow fixed in background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-64 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <Navbar user={user} storeName={storeName} />
      <Hero />

      {/* Stats Section */}
      <div className="border-y border-white/5 bg-zinc-900/30 backdrop-blur-sm relative z-10">
        <Stats productsCount={products.length} statsData={stats} />
      </div>

      {/* Products / Collection Section */}
      <section id="collection" className="relative z-10 max-w-7xl mx-auto px-6 py-28">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-16">
          <div>
            <Chip
              variant="soft"
              size="sm"
              className="bg-indigo-500/10 text-indigo-400 border-none text-[10px] font-bold tracking-widest uppercase mb-3"
            >
              Collection
            </Chip>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Inventory Matrix</h2>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                Live sync with {storeName}
              </p>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedCategory === null ? "secondary" : "outline"}
              onPress={() => setSelectedCategory(null)}
              className={`h-10 px-5 rounded-xl font-bold uppercase tracking-widest text-[10px] ${
                selectedCategory === null
                  ? "bg-white text-black"
                  : "border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
              }`}
            >
              All
            </Button>
            {uniqueCategories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? "secondary" : "outline"}
                onPress={() => setSelectedCategory(cat)}
                className={`h-10 px-5 rounded-xl font-bold uppercase tracking-widest text-[10px] ${
                  selectedCategory === cat
                    ? "bg-white text-black"
                    : "border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <ProductGrid products={filteredProducts} currency={currency} />
      </section>

      {/* Features Section */}
      <div className="border-t border-white/5 bg-zinc-900/20 relative z-10">
        <Features />
      </div>

      {/* Reviews Section */}
      <div id="reviews" className="border-t border-white/5 bg-zinc-950 relative z-10">
        <Reviews />
      </div>

      <Footer 
        storeName={storeName} 
        storeEmail={store?.email}
        storeInstagram={store?.instagram}
        storeWhatsapp={store?.whatsapp}
      />
    </main>
  );
}
