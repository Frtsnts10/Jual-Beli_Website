"use client";

import React from "react";
import { Product } from "../actions/product-actions";
import { ShoppingCart, Package, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/features/cart/context/cart-context";
import { getProductImage } from "../utils/product-assets";
import { ProductGroup, groupProducts } from "../utils/product-grouping";
import { VariantSelectionModal } from "./variant-selection-modal";
import { Card, Button, Chip } from "@heroui/react";
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
  const [selectedGroup, setSelectedGroup] = React.useState<ProductGroup | null>(null);
  
  const currencySymbol = currency === "USD" ? "$" : (currency === "IDR" ? "Rp" : (currency || "Rp"));
  
  const groups = React.useMemo(() => groupProducts(products), [products]);

  if (groups.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-3xl backdrop-blur-sm"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <Package className="w-7 h-7 text-zinc-600" />
        </div>
        <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">No products in cart</p>
      </motion.div>
    );
  }

  const handleAddGroup = (e: React.MouseEvent, group: ProductGroup) => {
    e.preventDefault();
    e.stopPropagation();
    if (group.variants.length === 1) {
      addToCart(group.variants[0]);
      setIsCartOpen(true);
    } else {
      setSelectedGroup(group);
    }
  };

  const gridClass = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4";

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={gridClass}
    >
      <AnimatePresence mode="popLayout">
        {groups.map((group) => {
          const firstWord = group.name;
          const defaultImage = group.imageUrl;
          const variantsText = group.variantNames.length > 1 ? `${group.variantNames.length} Options` : group.variantNames[0];

          return (
            <motion.div
              key={group.id}
              variants={itemVariants}
              layout
              className="block group"
              onClick={() => setSelectedGroup(group)}
            >
              <motion.div 
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-zinc-900 border border-white/5 hover:border-indigo-500/40 rounded-3xl transition-colors duration-500 overflow-hidden shadow-2xl backdrop-blur-sm flex flex-col h-full justify-between ${group.totalStock === 0 ? 'opacity-80 grayscale-[30%]' : 'cursor-pointer'}`}
              >
                <div>
                  {/* Product Image */}
                  <div className="block relative aspect-video overflow-hidden bg-default-100">
                    <img
                      src={defaultImage}
                      alt={group.name}
                      className="object-cover w-full h-full opacity-60 transition-transform duration-500 group-hover:scale-110 z-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-zinc-950/20 z-10 pointer-events-none" />

                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                      <Chip
                        size="sm"
                        variant="soft"
                        className="bg-black/60 backdrop-blur-md text-zinc-300 text-[9px] font-black uppercase tracking-widest border border-white/10"
                      >
                        {firstWord}
                      </Chip>
                      {variantsText && variantsText.toUpperCase() !== "STANDARD" && (
                        <Chip
                          size="sm"
                          variant="soft"
                          className="bg-black/60 backdrop-blur-md text-zinc-300 text-[9px] font-black uppercase tracking-widest border border-white/10"
                        >
                          {variantsText.toUpperCase()}
                        </Chip>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="px-5 pt-5 pb-3">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-indigo-400 transition-colors mb-2">
                      {firstWord}
                    </h3>
                    <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed h-8">
                      Category: {group.category || "Digital Asset"}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      {group.totalStock > 0 ? (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                            {group.variants.length > 1 ? variantsText : `${group.totalStock} in reserve`}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">
                            Sold Out
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                  <div>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">From</p>
                    <span className="text-lg font-black text-white tracking-tighter leading-none">
                      {currencySymbol}{group.basePrice.toLocaleString()}
                    </span>
                  </div>
                  {group.totalStock > 0 ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleAddGroup(e, group)}
                      className="flex items-center justify-center gap-1.5 bg-white text-black font-black uppercase tracking-wider text-[9px] sm:text-[10px] rounded-xl px-3 h-9 sm:h-10 hover:bg-indigo-500 hover:text-white transition-colors cursor-pointer shrink-0 w-full sm:w-auto"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {group.variants.length > 1 ? "Select" : "Add"}
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        alert("Notify me feature coming soon!");
                      }}
                      className="flex items-center justify-center gap-1.5 bg-zinc-800 text-zinc-300 font-black uppercase tracking-wider text-[9px] sm:text-[10px] rounded-xl px-3 h-9 sm:h-10 hover:bg-zinc-700 transition-colors cursor-pointer shrink-0 w-full sm:w-auto"
                    >
                      Notify Me
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <VariantSelectionModal 
        isOpen={!!selectedGroup} 
        onClose={() => setSelectedGroup(null)} 
        group={selectedGroup} 
        currencySymbol={currencySymbol} 
      />
    </motion.div>
  );
}
