/** products/{id}.rating — count of VISIBLE reviews per star, kept in step by the review writers. */
export type RatingCounts = Record<"1" | "2" | "3" | "4" | "5", number>;

export const STARS = ["5", "4", "3", "2", "1"] as const;

export function ratingCounts(v: unknown): RatingCounts {
  const src = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const n = (k: string) => (typeof src[k] === "number" && (src[k] as number) > 0 ? Math.floor(src[k] as number) : 0);
  return { "1": n("1"), "2": n("2"), "3": n("3"), "4": n("4"), "5": n("5") };
}

export function ratingSummary(c: RatingCounts) {
  const count = STARS.reduce((s, k) => s + c[k], 0);
  const sum = STARS.reduce((s, k) => s + Number(k) * c[k], 0);
  return { count, avg: count ? Math.round((sum / count) * 10) / 10 : 0 };
}

/** "Indra Baru Santoso" → "Indra B." — reviews never show a buyer's full name. */
export function reviewerName(full: string) {
  const [first, ...rest] = full.trim().split(/\s+/).filter(Boolean);
  if (!first) return "Pembeli";
  const last = rest.at(-1);
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
}
