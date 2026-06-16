import { getProductAction } from "@/features/products/actions/product-actions";
import { getStoreAction } from "@/features/stores/actions/store-actions";
import { getAuthenticatedUser } from "@/lib/firebase/server";
import { notFound } from "next/navigation";
import { ProductDetailsClient } from "@/features/products/components/product-details-client";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductAction(id);
  
  if (!product) {
    return notFound();
  }

  const storeId = process.env.NEXT_PUBLIC_STORE_ID!;
  const store = await getStoreAction(storeId);
  const storeName = store?.name || "Premium Storefront";
  const currency = store?.currency === "USD" ? "$" : (store?.currency === "IDR" ? "Rp" : "Rp");

  const decoded = await getAuthenticatedUser();
  const user = decoded ? { email: decoded.email, uid: decoded.uid, name: decoded.name } : null;

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col justify-between">
      {/* Dynamic Ambient Spotlights */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <Navbar user={user} storeName={storeName} />

      <div className="flex-grow">
        <ProductDetailsClient product={product} currency={currency} />
      </div>

      <Footer 
        storeName={storeName} 
        storeEmail={store?.email}
        storeInstagram={store?.instagram}
        storeWhatsapp={store?.whatsapp}
      />
    </main>
  );
}
