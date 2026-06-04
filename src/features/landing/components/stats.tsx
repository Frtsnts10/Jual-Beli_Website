"use client";

import React from "react";
import { TrendingUp, Package2, Server, Activity } from "lucide-react";
import { motion, Variants } from "framer-motion";

interface StatsProps {
  productsCount: number;
  statsData?: {
    ordersCount: number;
    activeNodes: number;
    latency: string;
    uptime: string;
  };
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants: Variants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 14
    }
  }
};

export function Stats({ productsCount, statsData }: StatsProps) {
  const uptimeVal = statsData?.uptime || "99.99%";
  const nodesVal = statsData?.activeNodes !== undefined ? statsData.activeNodes.toLocaleString() : "1,240";
  const latencyVal = statsData?.latency || "14ms";

  const stats = [
    { label: "Uptime", value: uptimeVal, icon: TrendingUp, valueColor: "text-emerald-400", cardClass: "border-emerald-500/15 bg-emerald-500/5 hover:border-emerald-500/30" },
    { label: "Products", value: productsCount.toString(), icon: Package2, valueColor: "text-white", cardClass: "border-white/10 bg-white/[0.03] hover:border-white/20" },
    { label: "Active Nodes", value: nodesVal, icon: Server, valueColor: "text-blue-400", cardClass: "border-blue-500/15 bg-blue-500/5 hover:border-blue-500/30" },
    { label: "Avg Latency", value: latencyVal, icon: Activity, valueColor: "text-violet-400", cardClass: "border-violet-500/15 bg-violet-500/5 hover:border-violet-500/30" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-2 md:grid-cols-4 gap-5"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`border ${stat.cardClass} rounded-3xl transition-colors duration-300 shadow-xl backdrop-blur-sm`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${stat.valueColor}`} />
                  </div>
                </div>
                <p className={`text-4xl font-black tracking-tighter ${stat.valueColor}`}>{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
