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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white border border-stone-200 p-6 sm:p-8 rounded-3xl max-w-md w-full relative shadow-2xl flex flex-col"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-stone-400 hover:text-stone-900 transition-colors p-2 rounded-lg bg-stone-50 border border-stone-200 hover:border-stone-300"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-black text-stone-900 tracking-tighter uppercase mb-6">Edit Profile</h2>

            <div className="space-y-4 mb-8">
              <FormInput
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alexander Vance"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-stone-600">Phone Number (Optional)</label>
                <PhoneInput
                  value={phone}
                  onChange={(val) => setPhone(val)}
                  placeholder="812-3456-7890"
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
              <Button variant="ghost" onPress={onClose} className="text-stone-500 hover:text-stone-900 border-transparent">
                Cancel
              </Button>
              <Button onPress={handleSave} isDisabled={isLoading} className="bg-blue-600 text-white font-bold tracking-widest uppercase text-xs disabled:opacity-50">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
