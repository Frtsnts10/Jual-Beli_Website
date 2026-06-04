"use client";

import React from "react";
import { User, Database, Activity } from "lucide-react";
import { Card, Chip, Separator } from "@heroui/react";

interface IdentityCardProps {
  total_orders: number;
}

export function IdentityCard({ total_orders }: IdentityCardProps) {
  return (
    <Card className="bg-zinc-900 border border-white/10 rounded-3xl h-full">
      <div className="p-8">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-tight">Active Shard</h3>
            <Chip
              size="sm"
              variant="soft"
              className="mt-2 bg-indigo-500/10 text-indigo-400 border-none text-[9px] font-bold uppercase tracking-widest"
            >
              Tier: Enterprise
            </Chip>
          </div>
        </div>

        <Separator className="bg-white/5 mb-8" />

        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-zinc-600">
              <Database className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Acquisitions</span>
            </div>
            <span className="text-3xl font-black text-white tracking-tighter">{total_orders}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-zinc-600">
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Security</span>
            </div>
            <Chip
              size="sm"
              variant="soft"
              className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] font-black uppercase tracking-widest"
            >
              Operational
            </Chip>
          </div>
        </div>
      </div>
    </Card>
  );
}
