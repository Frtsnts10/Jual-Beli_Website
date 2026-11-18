/* eslint-disable @next/next/no-img-element -- sellers paste arbitrary https image URLs; next/image would need an open remotePatterns proxy */
import { cn } from "@/lib/utils";

const INITIAL_BG = ["bg-rose-200", "bg-amber-200", "bg-emerald-200", "bg-sky-200", "bg-violet-200"];

export function ProductImage({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  if (src) return <img src={src} alt={alt} loading="lazy" className={cn("object-cover", className)} />;
  const bg = INITIAL_BG[alt.length % INITIAL_BG.length];
  return (
    <div className={cn("flex items-center justify-center text-3xl font-bold text-black/40", bg, className)} aria-hidden>
      {alt.slice(0, 1).toUpperCase()}
    </div>
  );
}

export function StoreLogo({ src, name, className }: { src?: string; name: string; className?: string }) {
  if (!src) return null;
  return <img src={src} alt={name} className={cn("rounded-[var(--r-inner)] object-cover", className)} />;
}
