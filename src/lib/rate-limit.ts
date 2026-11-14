import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

// Fixed-window rate limiter on Firestore, so it works across every serverless instance
// without extra infrastructure. Keys are SHA-256(bucket + client IP) — raw IPs are never
// stored. Docs carry expire_at: enable a Firestore TTL policy on rate_limits.expire_at to
// have them cleaned up automatically.

export const LIMITS = {
  checkout: { max: 10, windowSec: 10 * 60 },
  track: { max: 20, windowSec: 10 * 60 },
  claim: { max: 5, windowSec: 60 * 60 },
  session: { max: 20, windowSec: 10 * 60 },
  account: { max: 30, windowSec: 10 * 60 },
  review: { max: 20, windowSec: 10 * 60 },
} as const;

async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}

/** Counts one attempt; returns false once the caller exceeded the bucket's limit. */
export async function allow(bucket: keyof typeof LIMITS): Promise<boolean> {
  const { max, windowSec } = LIMITS[bucket];
  const id = createHash("sha256").update(`${bucket}:${await clientIp()}`).digest("hex");
  const ref = adminDb.collection("rate_limits").doc(id);
  const now = Date.now();

  try {
    return await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const resetAt = (snap.get("reset_at") as Timestamp | undefined)?.toMillis() ?? 0;
      if (!snap.exists || resetAt <= now) {
        const reset = Timestamp.fromMillis(now + windowSec * 1000);
        tx.set(ref, { count: 1, reset_at: reset, expire_at: reset });
        return true;
      }
      const count = (snap.get("count") as number) + 1;
      tx.update(ref, { count });
      return count <= max;
    });
  } catch (err) {
    // Never block real buyers because the limiter itself failed.
    console.error("rate limit check failed:", err);
    return true;
  }
}
