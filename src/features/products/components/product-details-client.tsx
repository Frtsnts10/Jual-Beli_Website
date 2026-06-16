"use client";

import React, { useState } from "react";
import { Product } from "@/features/products/actions/product-actions";
import { useCart } from "@/features/cart/context/cart-context";
import { Button, Chip, Separator } from "@heroui/react";
import { ShoppingCart, ShieldCheck, Zap, ArrowLeft, PackageCheck } from "lucide-react";
import Link from "next/link";
import { getProductImage } from "@/features/products/utils/product-assets";
import { WishlistButton } from "@/features/wishlist/components/wishlist-button";

interface ProductDetailsClientProps {
  product: Product;
  currency: string;
}

export function ProductDetailsClient({ product, currency }: ProductDetailsClientProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const image = getProductImage(product.name, product.category);

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(q => q + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 py-28 w-full">
      {/* Back Link */}
      <Link href="/products" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-10">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Left: Image */}
        <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 group">
          <img src={image} alt={product.name} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
          
          <div className="absolute top-6 left-6">
            {product.category && (
              <Chip size="sm" variant="soft" className="bg-black/60 backdrop-blur-md text-zinc-400 text-[10px] font-bold uppercase tracking-widest border-none">
                {product.category}
              </Chip>
            )}
          </div>
          
          <div className="absolute top-6 right-6">
            <WishlistButton product={product} variant="flat" className="bg-black/60 backdrop-blur-md border border-white/10 text-white w-12 h-12" />
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col justify-center">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase text-white mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 text-zinc-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <PackageCheck size={16} className="text-emerald-500" />
                  {product.stock} in stock
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <div>ID: {product.id.slice(0, 8)}</div>
              </div>
            </div>

            <Separator className="bg-white/5" />

            <div className="font-black text-5xl text-white">
              {currency} {product.selling_price.toLocaleString("id-ID")}
            </div>

            <p className="text-zinc-400 leading-relaxed min-h-[100px]">
              {product.description || "This premium digital artifact provides immediate access to the specified resources. Encrypted and secured by Obsidian Protocol. Ensure your client vault is prepared for instant allocation upon checkout."}
            </p>

            <Separator className="bg-white/5" />

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-zinc-900 border border-white/10 rounded-2xl h-14 p-1">
                <Button isIconOnly variant="ghost" onPress={decreaseQuantity} isDisabled={quantity <= 1} className="w-12 h-full text-white">
                  -
                </Button>
                <div className="w-12 text-center font-bold text-white">
                  {quantity}
                </div>
                <Button isIconOnly variant="ghost" onPress={increaseQuantity} isDisabled={quantity >= product.stock} className="w-12 h-full text-white">
                  +
                </Button>
              </div>

              <Button
                className="flex-1 h-14 font-black uppercase tracking-widest text-xs rounded-2xl bg-indigo-600 text-white"
                onPress={() => {
                  for (let i = 0; i < quantity; i++) {
                    addToCart(product);
                  }
                }}
              >
                <ShoppingCart size={18} className="mr-2" /> Add to Cart
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-emerald-500 mt-0.5" size={20} />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-1">Zero-Trust Vault</h4>
                  <p className="text-[10px] text-zinc-500 font-medium">Assets are delivered with AES-256 encryption directly to your matrix.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="text-amber-500 mt-0.5" size={20} />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-1">Instant Delivery</h4>
                  <p className="text-[10px] text-zinc-500 font-medium">Webhook protocols trigger allocations immediately upon auth validation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
