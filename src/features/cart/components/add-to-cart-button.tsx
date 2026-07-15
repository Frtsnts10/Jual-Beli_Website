"use client";

import { Button } from "@heroui/react";
import { Product } from "@/types/schema";
import { useCartStore } from "../store";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCartStore();

  return (
    <Button 
      size="lg" 
      variant="primary" 
      className="font-semibold flex-1 rounded-xl h-14 text-base"
      onPress={() => addItem(product)}
    >
      Add to Cart
    </Button>
  );
}
