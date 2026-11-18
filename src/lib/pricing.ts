import { effectivePrice, type Product } from "@/types/schema";

/** What the buyer pays now. Flash-sale prices count only when the store's plan includes Marketing. */
export function priceFor(product: Product, features: { marketing: boolean }, now = new Date()) {
  if (!features.marketing) return { price: product.price, original: null, endsAt: null };
  return effectivePrice(product, now);
}
