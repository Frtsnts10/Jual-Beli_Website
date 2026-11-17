"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { btnPrimary } from "@/lib/ui";

export interface HeroSlideView {
  id: string;
  image_url: string;
  image_mobile_url: string | null;
  title: string;
  subtitle: string;
  cta_label: string;
  /** Already resolved: the product page on this store, or an external https link. */
  href: string | null;
}

/**
 * The seller's hero banner (Pengaturan → Toko → Banner hero) above every template. Several
 * slides become a swipeable carousel that advances every 6 s (not with reduced motion, and
 * not while the visitor hovers or has just swiped). Shape and button follow the store theme.
 */
export function HeroBanner({ slides }: { slides: HeroSlideView[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    if (slides.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      if (paused.current || !track.current) return;
      const el = track.current;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % slides.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;
  return (
    <section aria-label="Promo" className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
      <div
        className="t-media relative"
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
        onTouchStart={() => (paused.current = true)}
      >
        <div
          ref={track}
          className="flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        >
          {slides.map((s, i) => (
            <div key={s.id} className="relative aspect-square w-full shrink-0 snap-start sm:aspect-[8/3]">
              <picture>
                {s.image_mobile_url && <source media="(max-width: 639px)" srcSet={s.image_mobile_url} />}
                <img src={s.image_url} alt={s.title} className="size-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
              </picture>
              {(s.title || s.subtitle || (s.cta_label && s.href)) && (
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-5 text-white sm:justify-center sm:bg-gradient-to-r sm:p-10">
                  <div className="max-w-xl">
                    {s.title && <h2 className="t-heading text-2xl leading-tight sm:text-4xl">{s.title}</h2>}
                    {s.subtitle && <p className="mt-2 text-sm text-white/85 sm:text-base">{s.subtitle}</p>}
                    {s.cta_label && s.href && (
                      <Link
                        href={s.href}
                        className={cn(btnPrimary, "mt-4")}
                        {...(s.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {s.cta_label}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {slides.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={cn("t-pill h-2 transition-all", i === index ? "w-6 bg-white" : "w-2 bg-white/50")}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
