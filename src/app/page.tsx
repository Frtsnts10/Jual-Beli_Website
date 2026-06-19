import React from "react";
import { getProductsAction } from "@/features/products/actions/product-actions";
import { getStoreAction, getStorefrontStatsAction } from "@/features/stores/actions/store-actions";
import { getDigitalAccountsAction } from "@/features/digital-accounts/actions/digital-account-actions";
import { getAuthenticatedUser } from "@/lib/firebase/server";
import { LandingPageClient } from "@/features/landing/components/landing-page-client";
import { getReviewsAction } from "@/features/reviews/actions/review-actions";

export default async function StorefrontLanding() {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!;
  const [products, store, stats, digitalAccounts, reviews] = await Promise.all([
    getProductsAction(storeId),
    getStoreAction(storeId),
    getStorefrontStatsAction(storeId),
    getDigitalAccountsAction(storeId),
    getReviewsAction(storeId)
  ]);
  
  const decoded = await getAuthenticatedUser();
  // Transform to a simpler user object for the client component
  const user = decoded ? { email: decoded.email, uid: decoded.uid, name: decoded.name } : null;

  return (
    <LandingPageClient 
      products={products} 
      store={store} 
      user={user} 
      stats={stats} 
      digitalAccounts={digitalAccounts}
      reviews={reviews}
    />
  );
}
