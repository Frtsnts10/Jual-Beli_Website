"use client";

import React from "react";
import { Shield } from "lucide-react";
import { Card, TooltipTrigger, TooltipContent, Tooltip } from "@heroui/react";
import { Product } from "../actions/product-actions";
import { getProductImage } from "../utils/product-assets";

interface ProductImageProps {
  product: Product;
}

export function ProductImage({ product }: ProductImageProps) {
  const imageUrl = getProductImage(product.name, product.category);

  return (
    <div className="lg:col-span-7">
      <Card className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden min-h-[500px] group">
        <div className="relative w-full min-h-[500px]">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover absolute inset-0 transition-transform duration-1000 group-hover:scale-105"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-zinc-950/20 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />

          {/* Auth badge */}
          <div className="absolute bottom-8 left-8">
            <Tooltip>
              <TooltipTrigger>
                <div
                  className="w-12 h-12 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-indigo-400 cursor-help shadow-xl"
                  role="button"
                  tabIndex={0}
                >
                  <Shield className="w-5 h-5" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-900 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white px-3 py-1.5 rounded-lg">
                Authenticated Artifact
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Card>
    </div>
  );
}
