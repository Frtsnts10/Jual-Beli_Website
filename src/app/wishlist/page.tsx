"use client";

import { useWishlist } from "@/features/wishlist/hooks/use-wishlist";
import { Card, CardFooter, Button } from "@heroui/react";
import { HeartCrack, ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart/context/cart-context";
import Link from "next/link";
import { WishlistButton } from "@/features/wishlist/components/wishlist-button";

export default function WishlistPage() {
  const { items } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <HeartCrack className="w-20 h-20 text-default-300 mb-6" />
        <h1 className="text-3xl font-bold mb-3">Your wishlist is empty</h1>
        <p className="text-default-500 mb-8 max-w-md">
          Save items you love and they will appear here. Find something awesome in our catalog!
        </p>
        <Button size="lg" className="rounded-full bg-primary text-white">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">My Wishlist</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((product) => (
          <Card key={product.id} className="border border-default-200 bg-background/50 backdrop-blur-md">
            <div className="p-0 relative group">
              <div className="aspect-video w-full bg-default-100 flex items-center justify-center">
                <span className="text-default-400 font-medium tracking-widest uppercase">
                  {product.name.substring(0, 2)}
                </span>
              </div>
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <WishlistButton product={product} variant="flat" className="bg-background/80 backdrop-blur-md" />
              </div>
            </div>
            <CardFooter className="flex-col items-start gap-2 p-4">
              <div className="w-full flex justify-between items-start gap-2">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                    {product.category || "Digital Product"}
                  </p>
                  <h3 className="text-lg font-bold line-clamp-1">{product.name}</h3>
                </div>
              </div>
              <div className="w-full flex justify-between items-center mt-2">
                <p className="text-xl font-bold">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0
                  }).format(product.selling_price)}
                </p>
                <Button
                  isIconOnly
                  variant="primary"
                  size="sm"
                  onPress={() => addToCart({
                    id: product.id,
                    name: product.name,
                    selling_price: product.selling_price,
                    stock: product.stock,
                    category: product.category,
                    created_at: product.created_at,
                  })}
                >
                  <ShoppingCart size={16} />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
