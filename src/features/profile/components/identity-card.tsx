"use client";

import React, { useState } from "react";
import { User, Database, Activity, Mail, Phone, Edit2 } from "lucide-react";
import { Card, Chip, Separator, Button } from "@heroui/react";
import { EditProfileModal } from "./edit-profile-modal";

interface IdentityCardProps {
  total_orders: number;
  customer: { id: string | null; name: string; email: string; phone: string };
  storeId: string;
}

export function IdentityCard({ total_orders, customer, storeId }: IdentityCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const displayName = customer.name || "Valued Customer";
  
  return (
    <>
      <Card className="bg-zinc-900 border border-white/10 rounded-3xl h-full relative overflow-hidden group">
        <div className="absolute top-4 right-4 z-10">
          <Button isIconOnly variant="flat" size="sm" className="bg-white/10 text-white hover:bg-white/20 rounded-full" onPress={() => setIsEditOpen(true)}>
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-8">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-base font-black text-white uppercase tracking-tight truncate">{displayName}</h3>
              <Chip
                size="sm"
                variant="soft"
                className="mt-2 bg-indigo-500/10 text-indigo-400 border-none text-[9px] font-bold uppercase tracking-widest"
              >
                Member
              </Chip>
            </div>
          </div>

          <Separator className="bg-white/5 mb-8" />

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Email Address</span>
                <span className="text-xs font-medium text-white truncate">{customer.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Phone Number</span>
                <span className="text-xs font-medium text-white truncate">{customer.phone || "Not provided"}</span>
              </div>
            </div>

            <Separator className="bg-white/5" />

            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center gap-3 text-zinc-600">
                <Database className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Total Orders</span>
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">{total_orders}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-zinc-600">
                <Activity className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Account Status</span>
              </div>
              <Chip
                size="sm"
                variant="soft"
                className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] font-black uppercase tracking-widest"
              >
                Active
              </Chip>
            </div>
          </div>
        </div>
      </Card>
      
      <EditProfileModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        customer={customer} 
        storeId={storeId} 
      />
    </>
  );
}
