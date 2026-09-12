import { adminDb } from "@/lib/firebase/server";

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  ctaText: string | null;
  ctaLink: string | null;
}

export async function getCarouselSlides(storeId?: string): Promise<CarouselSlide[]> {
  const id = storeId || process.env.NEXT_PUBLIC_STORE_ID;
  if (!id) return [];

  try {
    const snap = await adminDb.collection("carousel_slides")
      .where("store_id", "==", id)
      .where("active", "==", true)
      .orderBy("order", "asc")
      .get();

    return snap.docs.map((doc) => {
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
