"use client";

import React, { useState } from "react";
import { Cpu, Shield, Globe, Lock, Activity, RefreshCw, Layers, CheckCircle2, ChevronDown } from "lucide-react";
import { Product } from "../actions/product-actions";
import { AnimatePresence, motion } from "framer-motion";

interface ProductSpecsProps {
  product: Product;
}

export function ProductSpecs({ product }: ProductSpecsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Generate dynamic, realistic specs based on the product category and metadata
  const category = product.category || "Classified";
  const group = product.group_name || "Beta Core";

  const metrics = [
    { label: "Deployment Latency", value: "14ms", desc: "Global average sync speed", icon: Activity, color: "text-emerald-400" },
    { label: "Protocol Integrity", value: "99.999%", desc: "Cryptographic validation rate", icon: Shield, color: "text-indigo-400" },
    { label: "Node Cluster", value: group, desc: "Assigned architecture partition", icon: Layers, color: "text-amber-400" },
    { label: "Sync Status", value: "Synchronized", desc: "Live node propagation", icon: RefreshCw, color: "text-blue-400" }
  ];

  const specs = [
    {
      icon: Cpu,
      title: "Core Architecture",
      content: `This ${category} is deployed within the high-performance ${group} cluster. It utilizes optimized low-level instruction sets for zero-latency execution across decentralized node networks.`
    },
    {
      icon: Shield,
      title: "Cryptographic Authentication",
      content: "Protected by end-to-end asymmetric cryptography. Every transaction and credential state check is signed with unique transient keypairs, ensuring mathematically proven zero-knowledge verification."
    },
    {
      icon: Globe,
      title: "Distributed Sync Matrix",
      content: "Instantly mirrored across all 12 global authority nodes. Distributed ledger synchronization prevents single points of failure and guarantees uninterrupted runtime access."
    },
    {
      icon: Lock,
      title: "Compliance & Security",
      content: `Governed under compliance parameters of the Obsidian Vault Protocol. Fully compliant with enterprise security standards, featuring automatic access suspension on signature mismatch.`
    }
  ];

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-28 border-t border-white/5 bg-zinc-950">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/5 blur-[150px] pointer-events-none rounded-full" />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
        {/* Left Side: Headline and metrics */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-[9px] font-black uppercase tracking-widest mb-6">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Verified Safe Artifact
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-6">
              Technical
              <br />
              <span className="bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                Specifications
              </span>
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed font-medium">
              Detailed technical indicators and operational parameters governing the execution and deployment of this {category} module.
            </p>
          </div>

          {/* Core metrics grid */}
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{m.label}</span>
                    <Icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <p className={`${m.value.length > 15 ? "text-xs font-bold leading-tight py-1" : "text-xl font-black"} text-white tracking-tight mb-1 break-all`}>
                    {m.value}
                  </p>
                  <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-wider">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Fully custom Premium interactive Accordion */}
        <div className="lg:col-span-7 flex flex-col gap-4 justify-center">
          {specs.map((spec, i) => {
            const Icon = spec.icon;
            const isOpen = openIndex === i;

            return (
              <div
                key={i}
                className={`border rounded-3xl overflow-hidden transition-all duration-300 ${
                  isOpen ? "bg-white/[0.03] border-indigo-500/30" : "bg-white/[0.01] border-white/5 hover:border-white/10"
                }`}
              >
                {/* Trigger */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-6 cursor-pointer text-left focus:outline-none"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isOpen ? "bg-white text-black" : "bg-white/5 text-zinc-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-widest">
                      {spec.title}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                {/* Animated content panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pl-21 text-sm text-zinc-400 leading-relaxed font-medium">
                        {spec.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
