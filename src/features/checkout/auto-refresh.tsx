"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Re-renders the server page every few seconds while the tab is visible (the payment page until
 * the seller confirms, Akun while an order is still in progress). Gives up after maxTries.
 */
export function AutoRefresh({ everyMs = 4000, maxTries = 75 }: { everyMs?: number; maxTries?: number }) {
  const router = useRouter();
  useEffect(() => {
    let tries = 0;
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (++tries > maxTries) return clearInterval(id);
      router.refresh();
    }, everyMs);
    return () => clearInterval(id);
  }, [router, everyMs, maxTries]);
  return null;
}
