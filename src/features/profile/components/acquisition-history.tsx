"use client";

import React from "react";
import { Package, Clock } from "lucide-react";
import { Card, Chip, TooltipTrigger, TooltipContent, Tooltip, Separator } from "@heroui/react";
import { getProductImage } from "@/features/products/utils/product-assets";

interface CopyButtonProps {
  value: string;
}

function CopyButton({ value }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`text-[9px] font-bold uppercase tracking-wider transition-all px-3 py-1.5 rounded-xl border shrink-0 ${
        copied
          ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
          : "text-zinc-400 border-white/5 bg-white/5 hover:text-white hover:border-white/10"
      }`}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function formatDateOnly(dateInput: string | Date) {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

interface AcquisitionHistoryProps {
  purchased_products: any[];
}

export function AcquisitionHistory({ purchased_products }: AcquisitionHistoryProps) {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center gap-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-widest shrink-0">Acquisition Matrix</h2>
        <Separator className="bg-white/5 hidden md:block" />
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      {/* Empty state */}
      {purchased_products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 border border-dashed border-white/10 rounded-3xl">
          <Package className="w-20 h-20 text-zinc-800 mb-6" />
          <p className="text-xs text-zinc-700 font-black uppercase tracking-widest">Vault is currently empty</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {purchased_products.map((order, idx) => {
            const imageUrl = getProductImage(order.name, null);
            return (
              <Card
                key={idx}
                className="bg-zinc-900 border border-white/5 hover:border-white/15 rounded-3xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    {/* Product thumbnail + name */}
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-zinc-800">
                        <img src={imageUrl} alt={order.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2">{order.name}</h4>
                        <div className="flex items-center gap-2">
                          <Chip size="sm" variant="soft" className="bg-white/5 text-[9px] font-bold uppercase tracking-widest text-zinc-500 border-none">
                            {order.variant}
                          </Chip>
                          <Chip size="sm" variant="soft" className="bg-white/5 text-[9px] font-bold uppercase tracking-widest text-zinc-500 border-none">
                            {order.duration_days} Days
                          </Chip>
                        </div>
                      </div>
                    </div>

                    {/* Metadata grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-16">
                      <div>
                        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">Acquired</p>
                        <p className="text-xs text-white font-bold">
                          {formatDateOnly(order.bought_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-zinc-650 font-black uppercase tracking-widest mb-1">Status</p>
                        <Chip
                          size="sm"
                          variant="soft"
                          className={`text-[9px] font-black uppercase tracking-widest border-none ${
                            order.status === "banned"
                              ? "bg-rose-500/10 text-rose-500"
                              : "bg-emerald-500/10 text-emerald-500"
                          }`}
                        >
                          {order.status === "banned" ? "Restricted" : "Operational"}
                        </Chip>
                      </div>
                      <div>
                        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">Expires</p>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold cursor-help">
                              <Clock className="w-3.5 h-3.5 opacity-60" />
                              {formatDateOnly(order.expire_date)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-zinc-900 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white px-3 py-1.5 rounded-lg">
                            Protocol Termination Date
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  {/* Credentials / Status Tracker */}
                  {order.credentials ? (
                    <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 font-bold">
                          🔑 Decrypted Access Credentials
                        </div>
                        {order.credentials.group_assigned && (
                          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-500 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl">
                            <span>Node: {order.credentials.group_assigned}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Username */}
                        <div className="bg-black/30 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                          <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-2 block">
                            Account Username
                          </span>
                          <div className="flex items-center justify-between gap-3 min-w-0">
                            <span className="text-xs font-mono font-bold truncate text-white min-w-0">{order.credentials.email}</span>
                            <CopyButton value={order.credentials.email} />
                          </div>
                        </div>

                        {/* Password */}
                        <div className="bg-black/30 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                          <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-2 block">
                            Account Password
                          </span>
                          <div className="flex items-center justify-between gap-3 min-w-0">
                            <span className="text-xs font-mono font-bold truncate text-white min-w-0">{order.credentials.password}</span>
                            <CopyButton value={order.credentials.password} />
                          </div>
                        </div>

                        {/* PIN */}
                        {order.credentials.pin && (
                          <div className="bg-black/30 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                            <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-2 block">
                              📍 Profile PIN Allocation
                            </span>
                            <div className="flex items-center justify-between gap-3 min-w-0">
                              <span className="text-xs font-mono font-bold truncate text-white min-w-0">{order.credentials.pin}</span>
                              <CopyButton value={order.credentials.pin} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-2 text-zinc-500 text-[9px] font-black uppercase tracking-widest leading-none">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                      <span>Fulfilling Shard... Allocating unique digital warehouse credentials.</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
