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
      <Card className="bg-white border border-stone-200 shadow-sm rounded-3xl h-full relative overflow-hidden group">
        <div className="absolute top-4 right-4 z-10">
          <Button isIconOnly variant="secondary" size="sm" className="bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-full" onPress={() => setIsEditOpen(true)}>
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-8">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-base font-black text-stone-900 uppercase tracking-tight truncate">{displayName}</h3>
              <Chip
                size="sm"
                variant="soft"
                className="mt-2 bg-blue-50 text-blue-700 border-none text-[9px] font-bold uppercase tracking-widest"
              >
                Member
              </Chip>
            </div>
          </div>

          <Separator className="bg-stone-200 mb-8" />

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-stone-500" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[9px] font-black uppercase tracking-widest text-stone-500">Email Address</span>
                <span className="text-xs font-medium text-stone-900 truncate">{customer.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-stone-500" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[9px] font-black uppercase tracking-widest text-stone-500">Phone Number</span>
                <span className="text-xs font-medium text-stone-900 truncate">{customer.phone || "Not provided"}</span>
              </div>
            </div>

            <Separator className="bg-stone-200" />

            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center gap-3 text-stone-500">
                <Database className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Total Orders</span>
              </div>
              <span className="text-2xl font-black text-stone-900 tracking-tighter">{total_orders}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-stone-500">
                <Activity className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Account Status</span>
              </div>
              <Chip
                size="sm"
                variant="soft"
                className="bg-emerald-50 text-emerald-700 border-none text-[9px] font-black uppercase tracking-widest"
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
