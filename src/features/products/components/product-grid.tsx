"use client";

import React from "react";
import { Product } from "../actions/product-actions";
import { ShoppingCart, Package, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/features/cart/context/cart-context";
import { getProductImage } from "../utils/product-assets";
import { Chip } from "@heroui/react";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface ProductGridProps {
  products: Product[];
  currency?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0, scale: 0.97 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 16
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 }
  }
};

export function ProductGrid({ products, currency = "$" }: ProductGridProps) {
  const { addToCart, setIsCartOpen } = useCart();
  const currencySymbol = currency === "USD" ? "$" : (currency === "IDR" ? "Rp" : (currency || "Rp"));

  if (products.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-3xl backdrop-blur-sm"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <Package className="w-7 h-7 text-zinc-600" />
        </div>
        <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">No products in vault</p>
      </motion.div>
    );
  }

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setIsCartOpen(true);
  };

  const gridClass =
    products.length === 1
      ? "grid grid-cols-1 max-w-xs mx-auto gap-6"
      : products.length === 2
      ? "grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto gap-6"
      : products.length === 3
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto gap-6"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={gridClass}
    >
      <AnimatePresence mode="popLayout">
        {products.map((product) => {
          const imageUrl = getProductImage(product.name, product.category);

          return (
            <motion.div
              key={product.id}
              variants={itemVariants}
              layout
              className="block group"
            >
              <Link href={`/product/${product.id}`}>
                <motion.div 
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-zinc-900 border border-white/5 hover:border-indigo-500/40 rounded-3xl transition-colors duration-500 overflow-hidden shadow-2xl backdrop-blur-sm flex flex-col h-full justify-between"
                >
                  <div>
                    {/* Product Image */}
                    <div className="relative overflow-hidden aspect-[4/5]">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-zinc-950/20" />

                      {product.category && (
                        <div className="absolute top-4 left-4">
                          <Chip
                            size="sm"
                            variant="soft"
                            className="bg-black/60 backdrop-blur-md text-zinc-400 text-[9px] font-bold uppercase tracking-widest border-none"
                          >
                            {product.category}
                          </Chip>
                        </div>
                      )}

                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center">
                          <ArrowUpRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="px-5 pt-5 pb-3">
                      <h3 className="text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-indigo-400 transition-colors mb-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          {product.stock} in reserve
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-white/5 flex items-center justify-between gap-3 mt-4">
                    <span className="text-xl font-black text-white tracking-tighter">
                      {currencySymbol}{product.selling_price.toLocaleString()}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleAddToCart(e, product)}
                      className="flex items-center gap-2 bg-white text-black font-black uppercase tracking-wider text-[10px] rounded-xl px-4 h-10 hover:bg-indigo-500 hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Acquire
                    </motion.button>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
