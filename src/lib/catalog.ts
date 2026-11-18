import "server-only";
import { cache } from "react";
import { adminDb } from "@/lib/firebase/admin";
import { mergeCatalog, type Catalog } from "@/lib/catalog-core";

export * from "@/lib/catalog-core";

/** platform/catalog (set by platform admins in the dashboard) merged over the defaults. */
export const getCatalog = cache(async (): Promise<Catalog> => {
  try {
    const snap = await adminDb.collection("platform").doc("catalog").get();
    return mergeCatalog(snap.data());
  } catch (err) {
    console.error("platform/catalog unreadable, using defaults", err);
    return mergeCatalog(null);
  }
});
