import { adminDb } from "@/lib/firebase/server";
import { getActiveStoreId } from "@/lib/get-store-id";

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  ctaText: string | null;
  ctaLink: string | null;
}

export async function getCarouselSlides(storeId?: string): Promise<CarouselSlide[]> {
  const id = storeId || (await getActiveStoreId());
  if (!id) return [];

  try {
    // Filtering `active` in memory (instead of in the query) avoids depending on a
    // 3-field composite index for what is always a tiny, per-store slide list.
    const snap = await adminDb.collection("carousel_slides")
      .where("store_id", "==", id)
      .orderBy("order", "asc")
      .get();

    return snap.docs
      .filter((doc) => doc.data().active)
      .map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title,
          subtitle: d.subtitle || null,
          image: d.image_url,
          ctaText: d.cta_text || null,
          ctaLink: d.cta_link || null,
        };
      });
  } catch (err) {
    console.error("Error fetching carousel slides:", err);
    return [];
  }
}
