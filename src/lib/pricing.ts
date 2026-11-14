import { TIERS } from "@/config/tiers";
import { effectivePrice, type Product, type SubscriptionTier } from "@/types/schema";

/** What the buyer pays now. Flash-sale prices count only for Ultimate stores (Growth Engine). */
export function priceFor(product: Product, tier: SubscriptionTier, now = new Date()) {
  if (!TIERS[tier].marketing) return { price: product.price, original: null, endsAt: null };
  return effectivePrice(product, now);
}
