import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "../actions/product-actions";
import { ProductGroup } from "../utils/product-grouping";
import { ShoppingCart, X } from "lucide-react";
import { useCart } from "@/features/cart/context/cart-context";

interface VariantSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: ProductGroup | null;
  currencySymbol: string;
}

export function VariantSelectionModal({ isOpen, onClose, group, currencySymbol }: VariantSelectionModalProps) {
  const { addToCart, setIsCartOpen } = useCart();

  if (!group) return null;

  const handleSelectVariant = (variant: Product) => {
    addToCart(variant);
    setIsCartOpen(true);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-zinc-900 border border-white/10 p-6 sm:p-8 rounded-3xl max-w-md w-full relative shadow-2xl flex flex-col max-h-[80vh]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-zinc-500 hover:text-white transition-colors p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6 pr-8">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0">
                <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1">{group.category || "Digital Asset"}</p>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight truncate">{group.name}</h3>
              </div>
            </div>

            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 ml-1">Select Variant</div>
            
            <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {group.variants.map(variant => (
                <div 
                  key={variant.id}
                  className={`p-4 rounded-2xl border flex flex-col gap-3 transition-colors ${variant.stock > 0 ? 'bg-white/[0.02] border-white/5 hover:border-indigo-500/40' : 'bg-black/20 border-white/5 opacity-70 grayscale-[30%]'}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{variant.name}</h4>
                      {variant.description && <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{variant.description}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-white block">
                        {currencySymbol}{variant.selling_price.toLocaleString()}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${variant.stock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {variant.stock > 0 ? `${variant.stock} Left` : 'Sold Out'}
                      </span>
                    </div>
                  </div>

                  {variant.stock > 0 ? (
                    <button
                      onClick={() => handleSelectVariant(variant)}
                      className="w-full py-2.5 bg-white text-black hover:bg-indigo-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Acquire Option
                    </button>
                  ) : (
                    <button
                      onClick={() => alert("Notify me feature coming soon!")}
                      className="w-full py-2.5 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                      Notify Me
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
