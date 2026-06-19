"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/react";
import { PhoneInput } from "@/components/ui/phone-input";
import { FormInput } from "@/components/ui/form-input";
import { updateCustomerProfileAction } from "../actions/profile-actions";
import { X, Loader2 } from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: { id: string | null; name: string; email: string; phone: string };
  storeId: string;
}

export function EditProfileModal({ isOpen, onClose, customer, storeId }: EditProfileModalProps) {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    const res = await updateCustomerProfileAction(storeId, { name, phone });
    setIsLoading(false);
    
    if (res.error) {
      alert(res.error);
    } else {
      onClose();
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-zinc-950 border border-white/10 p-6 sm:p-8 rounded-3xl max-w-md w-full relative shadow-2xl flex flex-col"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-zinc-500 hover:text-white transition-colors p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-6">Edit Profile</h2>

            <div className="space-y-4 mb-8">
              <FormInput 
                label="Full Name"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Alexander Vance"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-zinc-400">Phone Number (Optional)</label>
                <PhoneInput 
                  value={phone} 
                  onChange={(val) => setPhone(val)} 
                  placeholder="812-3456-7890"
                  classNames={{
                    inputWrapper: "bg-zinc-900 border-white/10 data-[hover=true]:border-indigo-500/50 group-data-[focus=true]:border-indigo-500/50",
                    input: "text-white placeholder:text-zinc-500"
                  }}
                />
              </div>
              <FormInput 
                label="Email (Cannot be changed)"
                defaultValue={customer.email} 
                readOnly
                className="opacity-50 cursor-not-allowed"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onPress={onClose} className="text-zinc-400 hover:text-white border-transparent">
                Cancel
              </Button>
              <Button onPress={handleSave} disabled={isLoading} className="bg-indigo-600 text-white font-bold tracking-widest uppercase text-xs disabled:opacity-50">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
