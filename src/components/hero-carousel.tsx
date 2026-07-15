"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    title: "Premium Digital Accounts",
    subtitle: "Get access to your favorite apps at a fraction of the cost. Instant delivery.",
    image: "https://placehold.co/1200x600/111111/444444?text=Digital+Commerce",
    action: "Shop Now",
  },
  {
    id: 2,
    title: "Streaming Essentials",
    subtitle: "Netflix, Disney+, Spotify, and more. Guaranteed quality.",
    image: "https://placehold.co/1200x600/18181b/4f46e5?text=Streaming+Apps",
    action: "View Plans",
  },
  {
    id: 3,
    title: "Creative Tools",
    subtitle: "CapCut Pro, Canva, Adobe CC. Unlock your potential today.",
    image: "https://placehold.co/1200x600/27272a/ef4444?text=Creative+Tools",
    action: "Explore Tools",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
  const prev = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-neutral-950">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={SLIDES[current].image}
            alt={SLIDES[current].title}
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
              {SLIDES[current].title}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-neutral-300 max-w-2xl mb-10"
            >
              {SLIDES[current].subtitle}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button size="lg" variant="primary" className="font-semibold px-8 text-base h-14 rounded-full">
                {SLIDES[current].action}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 inset-x-0 flex justify-center gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
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
    </div>
  );
}
