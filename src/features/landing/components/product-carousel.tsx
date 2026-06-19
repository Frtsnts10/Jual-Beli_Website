"use client";

import React, { useRef } from "react";
import { Product } from "@/features/products/actions/product-actions";
import { Card, Button, Chip } from "@heroui/react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { getProductImage } from "@/features/products/utils/product-assets";
import { useCart } from "@/features/cart/context/cart-context";
import { WishlistButton } from "@/features/wishlist/components/wishlist-button";

interface ProductCarouselProps {
  products: Product[];
  currency: string;
}

export function ProductCarousel({ products, currency }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const currencySymbol = currency === "USD" ? "$" : (currency === "IDR" ? "Rp" : (currency || "Rp"));

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (!products || products.length === 0) return null;

  const featuredProducts = products.slice(0, 10);

  return (
    <section id="featured" className="relative w-full max-w-7xl mx-auto px-6 pt-32 pb-20 z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <Chip variant="soft" size="sm" className="bg-indigo-500/10 text-indigo-400 border-none text-[10px] font-bold tracking-widest uppercase mb-3">
            Featured
          </Chip>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight uppercase">
            Top Digital Assets
          </h1>
          <p className="text-default-500 mt-4 max-w-xl font-medium">
            Explore our curated selection of high-demand digital artifacts, available for instant deployment.
          </p>
        </div>
        <div className="flex gap-2">
          <Button isIconOnly variant="ghost" onPress={() => scroll("left")} className="rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 w-12 h-12">
            <ChevronLeft size={20} />
          </Button>
          <Button isIconOnly variant="ghost" onPress={() => scroll("right")} className="rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 w-12 h-12">
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 pb-12 -mx-6 px-6 lg:-mx-0 lg:px-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {featuredProducts.map((product) => {
          const firstWord = product.name.split(" ")[0].toUpperCase();
          const variantName = product.name.substring(firstWord.length).trim() || "STANDARD";
          const badgeText = `${firstWord}, ${variantName.toUpperCase()}`;
          const defaultImage = getProductImage(firstWord, product.category);

          return (
            <Card 
              key={product.id} 
              className="flex-none w-[85%] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-start group border border-default-200 bg-background/50 backdrop-blur-md overflow-hidden cursor-pointer"
            >
              <div className="block relative aspect-video overflow-hidden bg-default-100">
                <img 
                  src={defaultImage} 
                  alt={product.name} 
                  className="object-cover w-full h-full opacity-60 transition-transform duration-500 group-hover:scale-110 z-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent z-10 pointer-events-none" />
                
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <Chip size="sm" variant="soft" className="bg-black/60 backdrop-blur-md text-zinc-300 text-[9px] font-black uppercase tracking-widest border border-white/10">
                    {firstWord}
                  </Chip>
                  {variantName && variantName.toUpperCase() !== "STANDARD" && (
                    <Chip size="sm" variant="soft" className="bg-black/60 backdrop-blur-md text-zinc-300 text-[9px] font-black uppercase tracking-widest border border-white/10">
                      {variantName.toUpperCase()}
                    </Chip>
                  )}
                </div>
              </div>
              
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="font-black text-2xl mb-2 line-clamp-1 uppercase tracking-tight group-hover:text-primary transition-colors text-left">{firstWord}</h3>
                  <p className="text-xs text-default-500 min-h-[32px] line-clamp-2 text-left leading-relaxed">
                    Category: {product.category || "Digital Asset"}<br/>
                    <span className={product.stock > 0 ? "text-emerald-500" : "text-rose-500"}>
                      {product.stock > 0 ? `${product.stock} in reserve` : "Out of stock"}
                    </span>
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-8">
                  <div className="text-left">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">Price</p>
                    <div className="font-black text-2xl text-white leading-none">
                      {currencySymbol} {product.selling_price.toLocaleString("id-ID")}
                    </div>
                  </div>
                  {product.stock > 0 ? (
                    <Button
                      variant="primary"
                      className="font-black uppercase tracking-widest text-[10px] rounded-xl px-6 bg-primary text-white"
                      onPress={() => addToCart(product)}
                    >
                      <ShoppingCart size={16} className="mr-2" /> Add
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      className="font-black uppercase tracking-widest text-[10px] rounded-xl px-6 bg-zinc-800 text-zinc-400"
                    >
                      Sold Out
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
