"use client";

import React from "react";
import { Package2 } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { Product } from "@/features/products/actions/product-actions";

interface StatsProps {
  products: Product[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants: Variants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 14
    }
  }
};

export function Stats({ products }: StatsProps) {
  // Use up to 4 top products to display their stock
  const topProducts = products.slice(0, 4);
  const colors = [
    { valueColor: "text-emerald-400", cardClass: "border-emerald-500/15 bg-emerald-500/5 hover:border-emerald-500/30" },
    { valueColor: "text-blue-400", cardClass: "border-blue-500/15 bg-blue-500/5 hover:border-blue-500/30" },
    { valueColor: "text-violet-400", cardClass: "border-violet-500/15 bg-violet-500/5 hover:border-violet-500/30" },
    { valueColor: "text-amber-400", cardClass: "border-amber-500/15 bg-amber-500/5 hover:border-amber-500/30" },
  ];

  if (topProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-2 md:grid-cols-4 gap-5"
      >
        {topProducts.map((product, i) => {
          const colorTheme = colors[i % colors.length];
          return (
            <motion.div
              key={product.id}
              variants={cardVariants}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`border ${colorTheme.cardClass} rounded-3xl transition-colors duration-300 shadow-xl backdrop-blur-sm`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4 gap-4">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest line-clamp-1">
                    {product.name}
                  </p>
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Package2 className={`w-4 h-4 ${colorTheme.valueColor}`} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className={`text-4xl font-black tracking-tighter ${colorTheme.valueColor}`}>
                    {product.stock}
                  </p>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Left</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
