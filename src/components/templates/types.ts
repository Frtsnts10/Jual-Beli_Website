import type { Product } from "@/types/schema";
import type { PublicStore } from "@/lib/stores";

export type StoreProduct = Product & { href: string };

export interface TemplateProps {
  store: PublicStore;
  products: StoreProduct[];
  trackHref: string;
}
