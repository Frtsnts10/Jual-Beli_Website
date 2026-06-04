"use client";

import React from "react";
import { Product } from "../actions/product-actions";
import { Store } from "@/features/stores/actions/store-actions";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProductImage } from "./product-image";
import { ProductInfo } from "./product-info";
import { ProductSpecs } from "./product-specs";

interface ProductDetailClientProps {
  product: Product;
  store: Store | null;
  user: any;
}

export function ProductDetailClient({ product, store, user }: ProductDetailClientProps) {
  const currency = store?.currency === "USD" ? "$" : (store?.currency === "IDR" ? "Rp" : (store?.currency || "Rp"));
  const storeName = store?.name || "Premium Storefront";

  return (
    <main className="min-h-screen bg-zinc-950 overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <Navbar user={user} storeName={storeName} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-36 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
          <ProductImage product={product} />
          <div className="lg:col-span-5 flex flex-col justify-center">
            <ProductInfo product={product} currency={currency} />
          </div>
        </div>
      </div>

      <ProductSpecs product={product} />

      <Footer 
        storeName={storeName} 
        storeEmail={store?.email}
        storeInstagram={store?.instagram}
        storeWhatsapp={store?.whatsapp}
      />
    </main>
  );
}
