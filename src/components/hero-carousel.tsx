"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { CarouselSlide } from "@/features/carousel/api";

const FALLBACK_SLIDES: CarouselSlide[] = [
  {
    id: "fallback-1",
    title: "Premium Digital Accounts",
    subtitle: "Get access to your favorite apps at a fraction of the cost. Instant delivery.",
    image: "https://placehold.co/1200x600/111111/444444?text=Digital+Commerce",
    ctaText: "Shop Now",
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

  const next = () => setCurrent((prev) => (prev + 1) % activeSlides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);

  const slide = activeSlides[current];
  if (!slide) return null;

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-neutral-950">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 max-w-4xl"
            >
              {slide.title}
            </motion.h1>
            {slide.subtitle && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-neutral-300 max-w-2xl mb-10"
              >
                {slide.subtitle}
              </motion.p>
            )}
            {slide.ctaText && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Link href={slide.ctaLink || "/products"}>
                  <Button size="lg" variant="primary" className="font-semibold px-8 text-base h-14 rounded-full">
                    {slide.ctaText}
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {activeSlides.length > 1 && (
        <>
          <div className="absolute bottom-10 inset-x-0 flex justify-center gap-2 z-10">
            {activeSlides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                className={`w-12 h-1 rounded-full transition-colors ${current === i ? "bg-white" : "bg-white/30"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button onClick={prev} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/50 transition-colors backdrop-blur-md">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={next} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/50 transition-colors backdrop-blur-md">
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
}
