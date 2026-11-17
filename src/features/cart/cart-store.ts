"use client";

import { useSyncExternalStore } from "react";
import { MAX_QTY, type CartItemInput } from "@/lib/cart-math";

// The cart lives in this browser only (per store), like most shops' guest carts. Prices and
// stock are always re-read on the server at checkout.

const key = (storeId: string) => `cart:${storeId}`;
const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; items: CartItemInput[] }>();
const EMPTY: CartItemInput[] = [];

function read(storeId: string): CartItemInput[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key(storeId));
  } catch {}
  const hit = cache.get(storeId);
  if (hit && hit.raw === raw) return hit.items;
  let items: CartItemInput[] = EMPTY;
  try {
    const parsed = JSON.parse(raw ?? "[]");
    if (Array.isArray(parsed)) items = parsed.filter((i) => i && typeof i.id === "string" && Number.isInteger(i.qty) && i.qty > 0);
  } catch {}
  cache.set(storeId, { raw, items });
  return items;
}

function write(storeId: string, items: CartItemInput[]) {
  try {
    if (items.length) localStorage.setItem(key(storeId), JSON.stringify(items));
    else localStorage.removeItem(key(storeId));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key?.startsWith("cart:") && cb(); // other tabs
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart(storeId: string) {
  const items = useSyncExternalStore(
    subscribe,
    () => read(storeId),
    () => EMPTY,
  );
  return items;
}

export const cart = {
  add(storeId: string, id: string, qty = 1) {
    const items = read(storeId);
    const found = items.find((i) => i.id === id);
    write(
      storeId,
      found ? items.map((i) => (i.id === id ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i)) : [...items, { id, qty: Math.min(MAX_QTY, qty) }],
    );
  },
  set(storeId: string, id: string, qty: number) {
    write(storeId, qty < 1 ? read(storeId).filter((i) => i.id !== id) : read(storeId).map((i) => (i.id === id ? { ...i, qty: Math.min(MAX_QTY, qty) } : i)));
  },
  clear(storeId: string) {
    write(storeId, []);
  },
};
