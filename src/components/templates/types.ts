import type { StoreProductData } from "@/lib/stores";
import type { PublicStore } from "@/lib/stores";

export type StoreProduct = StoreProductData & {
  /** Checkout link (Beli). */
  href: string;
  /** Product detail page; the whole card links here (stretched link), the Beli button sits above it. */
  detailHref: string;
  /** Current selling price (flash sale applied) and the crossed-out normal price, if any. */
  sale: { price: number; original: number | null; endsAt: string | null };
};

export interface TemplateProps {
  store: PublicStore;
  products: StoreProduct[];
}
