import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only 0–5 star row (rounded to whole stars). */
export function Stars({ value, className, size = "size-4" }: { value: number; className?: string; size?: string }) {
  return (
    <span className={cn("inline-flex shrink-0", className)} role="img" aria-label={`${value} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn(size, n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-neutral-300")} />
      ))}
    </span>
  );
}
