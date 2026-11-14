import type { Product } from "@/types/schema";
import type { PublicStore } from "@/lib/stores";

export type StoreProduct = Product & {
  href: string;
  /** Current selling price (flash sale applied) and the crossed-out normal price, if any. */
  sale: { price: number; original: number | null; endsAt: string | null };
};

export interface TemplateProps {
  store: PublicStore;
  products: StoreProduct[];
  trackHref: string;
}
