"use client";

import React from "react";
import { Product } from "../actions/product-actions";
import { AddToCartButton } from "./add-to-cart-button";
import { Chip, Separator } from "@heroui/react";

interface ProductInfoProps {
  product: Product;
  currency: string;
}

export function ProductInfo({ product, currency }: ProductInfoProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Category + Name */}
      <div>
        <Chip
          variant="soft"
          size="sm"
          className="bg-indigo-500/10 text-indigo-400 border-none text-[10px] font-bold tracking-widest uppercase mb-4"
        >
          {product.category || "Classified"} Artifact
        </Chip>
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none mb-5">
          {product.name}
        </h1>
        <p className="text-base text-zinc-500 leading-relaxed font-medium">
          {product.description || "Experimental artifact retrieved from the deep protocol layers. Limited availability."}
        </p>
      </div>

      <Separator className="bg-white/5" />

      {/* Price */}
      <div>
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Acquisition Value</p>
        <p className="text-5xl font-black text-white tracking-tighter leading-none">
          {currency}{product.selling_price.toLocaleString()}
        </p>
      </div>

      {/* Stock status */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">Inventory Status</span>
        <span className={`text-[11px] font-black uppercase tracking-widest ${product.stock > 0 ? "text-emerald-500" : "text-rose-500"}`}>
          {product.stock > 0 ? `${product.stock} Units Available` : "Depleted"}
        </span>
      </div>

      <AddToCartButton product={product} />
    </div>
  );
}
