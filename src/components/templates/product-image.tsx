/* eslint-disable @next/next/no-img-element -- sellers paste arbitrary https image URLs; next/image would need an open remotePatterns proxy */
import { cn } from "@/lib/utils";
import { focusStyle, type ImageFocus } from "@/lib/image-focus";

const INITIAL_BG = ["bg-rose-200", "bg-amber-200", "bg-emerald-200", "bg-sky-200", "bg-violet-200"];

export function ProductImage({ src, alt, className, focus }: { src: string | null; alt: string; className?: string; focus?: ImageFocus | null }) {
  // A seller-set position: the frame clips the zoomed photo (className sizes the frame).
  if (src && focus)
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <img src={src} alt={alt} loading="lazy" className="absolute inset-0 size-full object-cover" style={focusStyle(focus)} />
      </div>
    );
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
