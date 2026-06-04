"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ArrowDown, Shield, Zap, Cpu } from "lucide-react";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 25, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 16
    }
  }
};

const headlineVariants: Variants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 14
    }
  }
};

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden px-6 pt-32 pb-24 text-center">

      {/* Ambient radial backgrounds */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)] pointer-events-none" 
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.3 }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,rgba(139,92,246,0.08),transparent)] pointer-events-none" 
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center max-w-4xl mx-auto w-full gap-10"
      >

        {/* Badge */}
        <motion.div 
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] font-bold tracking-widest uppercase"
        >
          <Cpu className="w-3 h-3 animate-pulse text-indigo-400" />
          Autonomous Commerce Protocol v2.0
        </motion.div>

        {/* Headline */}
        <div className="flex flex-col gap-2">
          <div className="overflow-hidden py-1">
            <motion.h1 
              variants={headlineVariants}
              className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-none text-white uppercase"
            >
              The Future of
            </motion.h1>
          </div>
          <div className="overflow-hidden py-1">
            <motion.h1 
              variants={headlineVariants}
              className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-none bg-gradient-to-r from-white via-indigo-200 to-indigo-500 bg-clip-text text-transparent uppercase"
            >
              Digital Assets.
            </motion.h1>
          </div>
        </div>

        {/* Subheading */}
        <motion.p 
          variants={itemVariants}
          className="text-[10px] sm:text-xs text-zinc-400 max-w-xl mx-auto leading-relaxed font-bold uppercase tracking-widest"
        >
          Secure, curated, and instantly accessible artifacts designed for the next generation of digital infrastructure.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-md"
        >
          <Link href="#collection" className="flex-1">
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-indigo-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-indigo-500/20"
            >
              Acquire Assets
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
          <Link href="/protocol" className="flex-1">
            <motion.button 
              whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 rounded-2xl border border-white/15 bg-white/5 text-white font-black uppercase tracking-widest text-[11px] hover:border-white/25 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              Protocol Docs
              <Cpu className="w-4 h-4 text-indigo-400" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust row */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-6 border border-white/5 bg-white/[0.02] rounded-3xl px-8 py-4 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
            <Shield className="w-4 h-4 text-emerald-500" />
            Verified Artifacts
          </div>
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
            <Zap className="w-4 h-4 text-blue-400" />
            Instant Delivery
          </div>
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            99.99% Uptime
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce"
      >
        <span className="text-[9px] text-white font-bold uppercase tracking-widest">Scroll</span>
        <ArrowDown className="w-3.5 h-3.5 text-white" />
      </motion.div>
    </section>
  );
}
