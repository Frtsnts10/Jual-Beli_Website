"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/react";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { CarouselSlide } from "@/features/carousel/api";

const FALLBACK_SLIDES: CarouselSlide[] = [
  {
    id: "fallback-1",
    title: "Premium apps, shared & affordable.",
    subtitle: "Netflix, Spotify, Canva and more — verified accounts delivered to your inbox in seconds.",
    image: "",
    ctaText: "Browse Products",
    ctaLink: "/products",
  },
];

interface HeroCarouselProps {
  slides?: CarouselSlide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const activeSlides = slides && slides.length > 0 ? slides : FALLBACK_SLIDES;
  const [current, setCurrent] = useState(0);

  // Reset position if the slide set changes size (e.g. after a dashboard update)
  useEffect(() => {
    if (current >= activeSlides.length) setCurrent(0);
  }, [activeSlides.length, current]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const slide = activeSlides[current];
  if (!slide) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-16 pt-14 pb-10 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[11.5px] font-bold px-3 py-1.5 rounded-full mb-5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Instant delivery, always
        </div>
        <h1 className="text-4xl md:text-[46px] leading-[1.08] font-extrabold tracking-tight text-stone-900 mb-4">
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p className="text-[16px] leading-relaxed text-stone-600 mb-7 max-w-md">
            {slide.subtitle}
          </p>
        )}
        <div className="flex gap-3">
          <Link href={slide.ctaLink || "/products"}>
            <Button className="bg-blue-600 text-white font-bold text-sm px-7 h-[52px] rounded-xl hover:bg-blue-700 transition-colors">
              {slide.ctaText || "Browse Products"}
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative h-[340px] rounded-[20px] overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-300">
        {slide.image && (
          <AnimatePresence mode="wait">
            <motion.img
              key={slide.id}
              src={slide.image}
              alt={slide.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
        )}
        <div className="absolute inset-0 p-7 flex flex-col justify-end">
          <div className="text-white/90 text-xs font-bold tracking-wide uppercase mb-1">Featured</div>
          <div className="text-white text-xl font-extrabold max-w-xs">{slide.title}</div>
        </div>

        {activeSlides.length > 1 && (
          <div className="absolute bottom-6 right-7 flex gap-1.5">
            {activeSlides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                className={`h-1 rounded-full transition-all ${current === i ? "w-6 bg-white" : "w-2 bg-white/40"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
