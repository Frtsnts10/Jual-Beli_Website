import React from "react";
import { getProductAction } from "@/features/products/actions/product-actions";
import { getStoreAction } from "@/features/stores/actions/store-actions";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/features/products/components/product-detail-client";
import { getAuthenticatedUser } from "@/lib/firebase/server";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await getProductAction(resolvedParams.id);
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!;
  const store = await getStoreAction(storeId);
  
  const decoded = await getAuthenticatedUser();
  const user = decoded ? { email: decoded.email, uid: decoded.uid, name: decoded.name } : null;

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} store={store} user={user} />;
}
