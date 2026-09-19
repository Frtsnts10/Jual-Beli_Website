import { Product } from "@/types/schema";
import { adminDb } from "@/lib/firebase/server";
import { getActiveStoreId } from "@/lib/get-store-id";

export async function getProducts(): Promise<Product[]> {
  const storeId = await getActiveStoreId();
  if (!storeId) return [];

  try {
    const snap = await adminDb.collection("inventory")
      .where("store_id", "==", storeId)
      .orderBy("created_at", "desc")
      .get();

    const aggregated = new Map<string, Product>();

    snap.docs.forEach(doc => {
      const data = doc.data();

      // Create a unique key for the product variant (e.g. "netflix-1u")
      const tier = data.profile_tier || "Standard";
      const key = `${data.name.toLowerCase()}-${tier.toLowerCase()}`.replace(/\s+/g, '-');

      if (aggregated.has(key)) {
        const existing = aggregated.get(key)!;
        existing.stock += (data.stock || 0);
        // Optional: Update price if we want minimum price, etc.
      } else {
        aggregated.set(key, {
          id: key, // Use the aggregated key as the ID/Slug for the storefront
          store_id: data.store_id,
          name: data.name,
          slug: key,
          description: `${data.name} — ${tier} Subscription`,
          price: data.selling_price || data.base_price || 0,
          currency: "IDR",
          images: ["https://placehold.co/600x600/18181b/4f46e5?text=" + encodeURIComponent(`${data.name}\n${tier}`)],
          category_id: data.category || "general",
          stock: data.stock || 0,
          created_at: data.created_at,
          updated_at: data.created_at,
          profile_tier: tier,
          category: data.category,
          group_name: data.group_name,
        });
      }
    });

    return Array.from(aggregated.values());
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  // Since slug is now an aggregated key (e.g. "netflix-1u"), 
  // we just fetch the aggregated products and find the matching one.
  const allProducts = await getProducts();
  return allProducts.find(p => p.slug === slug);
}
