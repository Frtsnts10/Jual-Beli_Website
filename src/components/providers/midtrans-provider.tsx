"use client";

import Script from "next/script";

export function MidtransProvider() {
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "dummy-client-key";
  const snapUrl = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <Script 
      src={snapUrl}
      data-client-key={clientKey}
      strategy="lazyOnload"
    />
  );
}
