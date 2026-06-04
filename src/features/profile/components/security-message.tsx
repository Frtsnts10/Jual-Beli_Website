"use client";

import React from "react";
import { Cpu, ShieldCheck } from "lucide-react";
import { Card, Chip } from "@heroui/react";

export function SecurityMessage() {
  return (
    <Card className="bg-indigo-950/30 border border-indigo-500/15 rounded-3xl h-full overflow-hidden">
      <div className="p-10 flex flex-col justify-center relative h-full">
        {/* Large background icon */}
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <ShieldCheck className="w-40 h-40 text-indigo-400" />
        </div>

        <Chip
          variant="soft"
          size="sm"
          className="bg-indigo-500/10 text-indigo-400 border-none text-[10px] font-bold uppercase tracking-widest mb-8 self-start"
        >
          <Cpu className="w-3 h-3 inline-block mr-1.5" />
          Obsidian Security Mesh
        </Chip>

        <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Failsafe Protocol Active</h3>
        <p className="text-base text-zinc-500 leading-relaxed font-medium max-w-lg">
          Your digital assets are encrypted and mirrored across 12 distributed nodes. Management and dispute resolution are handled via the decentralized authority protocol.
        </p>
      </div>
    </Card>
  );
}
