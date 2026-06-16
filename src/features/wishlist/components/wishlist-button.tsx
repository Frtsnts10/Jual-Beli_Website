"use client";

import { Heart } from "lucide-react";
import { Button } from "@heroui/react";
import { useWishlist } from "../hooks/use-wishlist";
import { Product } from "@/features/products/actions/product-actions";
import { useEffect, useState } from "react";
import { cn } from "@heroui/react";

interface WishlistButtonProps {
  product: Product;
  className?: string;
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "ghost" | any;
  isIconOnly?: boolean;
}

export function WishlistButton({ product, className, variant = "light", isIconOnly = true }: WishlistButtonProps) {
  const { items, addItem, removeItem, hasItem } = useWishlist();
  const [isMounted, setIsMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <Button isIconOnly={isIconOnly} variant={variant} className={className} isDisabled><Heart size={20} /></Button>;

  const isInWishlist = hasItem(product.id);

  const toggleWishlist = () => {
    if (isInWishlist) {
      removeItem(product.id);
    } else {
      addItem(product);
      setAnimate(true);
      setTimeout(() => setAnimate(false), 400); // duration of bounceOnce animation
    }
  };

  return (
    <Button
      isIconOnly={isIconOnly}
      variant={variant}
      onPress={toggleWishlist}
      className={cn(className, animate && "animate-bounce-once")}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={20}
        className={cn(
          "transition-colors",
          isInWishlist ? "fill-danger text-danger" : "text-default-500"
        )}
      />
    </Button>
  );
}
