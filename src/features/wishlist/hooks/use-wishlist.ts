import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/features/products/actions/product-actions";

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const currentItems = get().items;
        if (!currentItems.find((item) => item.id === product.id)) {
          set({ items: [...currentItems, product] });
        }
      },
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
      },
      hasItem: (productId) => {
        return get().items.some((item) => item.id === productId);
      },
    }),
    {
      name: "shop-wishlist",
    }
  )
);
