"use client";

import React, { useState } from "react";
import { Fingerprint, LayoutGrid, Zap, ArrowRight } from "lucide-react";
import { Chip } from "@heroui/react";
import { motion, Variants } from "framer-motion";

const features = [
  {
    icon: Fingerprint,
    title: "Identity Auth",
    desc: "Biometric-grade security protecting every transaction with military-level encryption and zero-knowledge proofs.",
    iconColor: "text-indigo-400",
    cardClass: "border-indigo-500/15 bg-indigo-500/5 hover:border-indigo-500/40",
    linkColor: "text-indigo-400",
  },
  {
    icon: LayoutGrid,
    title: "Bento Core",
    desc: "Meticulously organized artifact management designed to structure your entire digital portfolio with precision.",
    iconColor: "text-amber-400",
    cardClass: "border-amber-500/15 bg-amber-500/5 hover:border-amber-500/40",
    linkColor: "text-amber-400",
  },
  {
    icon: Zap,
    title: "Flash Delivery",
    desc: "Instant fulfillment and asset propagation through our globally distributed high-speed optical protocol network.",
    iconColor: "text-blue-400",
    cardClass: "border-blue-500/15 bg-blue-500/5 hover:border-blue-500/40",
    linkColor: "text-blue-400",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

const cardVariants: Variants = {
  hidden: { y: 40, opacity: 0, scale: 0.96 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15
    }
  }
};

export function Features() {
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isBentoModalOpen, setIsBentoModalOpen] = useState(false);
  const [isFlashModalOpen, setIsFlashModalOpen] = useState(false);

  return (
    <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
      {/* Header */}
      <div className="text-center mb-16">
        <p className="text-indigo-400 text-[10px] font-black tracking-widest uppercase mb-3">Why Choose Us</p>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 uppercase">Built for Performance</h2>
        <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed font-medium">
          Every layer of the platform is engineered for absolute reliability and speed.
        </p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {features.map((feature, i) => {
          const Icon = feature.icon;

          const handleLearnMore = () => {
            if (i === 0) {
              setIsSecurityModalOpen(true);
            } else if (i === 1) {
              setIsBentoModalOpen(true);
            } else if (i === 2) {
              setIsFlashModalOpen(true);
            }
          };

          return (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ scale: 1.025, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`border ${feature.cardClass} min-h-72 rounded-3xl backdrop-blur-sm transition-colors duration-300 flex flex-col justify-between p-8`}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 transition-transform">
                  <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-tight mb-3">{feature.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{feature.desc}</p>
              </div>
              <div
                onClick={handleLearnMore}
                className={`flex items-center gap-2 mt-8 ${feature.linkColor} text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity cursor-pointer`}
              >
                <span>Learn more</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Security Mesh Modal */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full relative shadow-2xl space-y-6">
            <button
              onClick={() => setIsSecurityModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest font-mono border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-lg bg-white/[0.02]"
            >
              [ ESC / CLOSE ]
            </button>
            <div>
              <Chip
                variant="soft"
                size="sm"
                className="bg-indigo-500/10 text-indigo-400 border-none text-[9px] font-bold uppercase tracking-widest mb-3"
              >
                Military-Grade Authentication Protocol
              </Chip>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Identity Auth Specs</h3>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-1.5 font-mono">Encryption Standard</p>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                  AES-256-GCM symmetric encryption secures all credentials shards prior to cold storage.
                </p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-[9px] text-amber-400 font-black uppercase tracking-widest mb-1.5 font-mono">Decentralized Auth</p>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                  Zero-knowledge proof validation gates order allocation, ensuring zero password exposure.
                </p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-1.5 font-mono">Failsafe Mirroring</p>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                  Encrypted database states are mirrored across 12 independent, geographically-isolated nodes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bento Core Modal */}
      {isBentoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full relative shadow-2xl space-y-6">
            <button
              onClick={() => setIsBentoModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest font-mono border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-lg bg-white/[0.02]"
            >
              [ ESC / CLOSE ]
            </button>
            <div>
              <Chip
                variant="soft"
                size="sm"
                className="bg-amber-500/10 text-amber-400 border-none text-[9px] font-bold uppercase tracking-widest mb-3"
              >
                Artifact Management Architecture
              </Chip>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Bento Core Specs</h3>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-[9px] text-amber-400 font-black uppercase tracking-widest mb-1.5 font-mono">Structural Integrity</p>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                  Each digital asset is compartmentalized in isolated memory cells, preventing data contamination.
                </p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-1.5 font-mono">Dynamic Categorization</p>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                  Real-time algorithmic sorting ensures your portfolio remains perfectly structured at any scale.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flash Delivery Modal */}
      {isFlashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl max-w-md w-full relative shadow-2xl space-y-6">
            <button
              onClick={() => setIsFlashModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest font-mono border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-lg bg-white/[0.02]"
            >
              [ ESC / CLOSE ]
            </button>
            <div>
              <Chip
                variant="soft"
                size="sm"
                className="bg-blue-500/10 text-blue-400 border-none text-[9px] font-bold uppercase tracking-widest mb-3"
              >
                Instant Propagation Network
              </Chip>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Flash Delivery Specs</h3>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-1.5 font-mono">Optical Speed</p>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                  Assets are delivered to your profile via edge-optimized networks in under 80 milliseconds.
                </p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-1.5 font-mono">Global Availability</p>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                  Redundant edge nodes ensure 99.999% uptime for instant fulfillment worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
