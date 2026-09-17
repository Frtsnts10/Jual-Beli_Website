"use client";

import React from "react";
import { Cpu, ShieldCheck } from "lucide-react";
import { Card, Chip } from "@heroui/react";

export function SecurityMessage() {
  return (
    <Card className="bg-blue-50 border border-blue-100 rounded-3xl h-full overflow-hidden">
      <div className="p-10 flex flex-col justify-center relative h-full">
        {/* Large background icon */}
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-40 h-40 text-blue-600" />
        </div>

        <Chip
          variant="soft"
          size="sm"
          className="bg-blue-100 text-blue-700 border-none text-[10px] font-bold uppercase tracking-widest mb-8 self-start"
        >
          <ShieldCheck className="w-3 h-3 inline-block mr-1.5" />
          Customer Guarantee
        </Chip>

        <h3 className="text-3xl font-black text-stone-900 uppercase tracking-tight mb-4">Secure Delivery Guarantee</h3>
        <p className="text-base text-stone-600 leading-relaxed font-medium max-w-lg">
          All purchases are protected by our secure delivery system. If you experience any issues accessing your digital products, our 24/7 support team is here to help.
        </p>
      </div>
    </Card>
  );
}
