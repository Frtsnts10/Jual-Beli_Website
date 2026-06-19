"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCart } from "../context/cart-context";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Package, Loader2, X, CreditCard, Calendar, Lock, User, CheckCircle2, ShieldAlert } from "lucide-react";
import { checkoutAction, PurchasedProduct } from "@/features/orders/actions/order-actions";
import { getStoreAction, Store } from "@/features/stores/actions/store-actions";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getProductImage } from "@/features/products/utils/product-assets";

export function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [store, setStore] = useState<Store | null>(null);
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storeId = process.env.NEXT_PUBLIC_STORE_ID;
    if (storeId) getStoreAction(storeId).then(setStore);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  const currency = store?.currency === "USD" ? "$" : (store?.currency === "IDR" ? "Rp" : (store?.currency || "Rp"));



  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Overlay - Clicking outside closes the modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsCartOpen(false);
            }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] cursor-pointer"
          />

          {/* Drawer Container - Styled to the Right Side */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border-l border-white/10 z-[10000] shadow-2xl shadow-black/80 flex flex-col h-full overflow-hidden"
          >
            {/* Main Cart Content (Slide left out of view if Stripe is open) */}
            <div className="flex flex-col h-full relative">
              
              {/* HEADER */}
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Active Cart</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                      {totalItems} {totalItems === 1 ? "item" : "items"} secured
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close cart"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* BODY - Cart Items */}
              <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                      <Package className="w-9 h-9 text-zinc-700" />
                    </div>
                    <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-6">Cart is empty</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="border border-white/10 text-zinc-400 hover:text-white rounded-xl font-bold uppercase tracking-widest text-[10px] px-6 h-10 transition-colors bg-white/5 cursor-pointer"
                    >
                      Browse Collection
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {cart.map((item) => {
                      const imageUrl = getProductImage(item.name, item.category);
                      return (
                        <div key={item.id} className="flex gap-5 group">
                          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-zinc-900">
                            <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <h4 className="text-xs font-black text-white uppercase tracking-tight truncate group-hover:text-indigo-400 transition-colors">
                                {item.name}
                              </h4>
                              <span className="text-xs font-black text-white shrink-0">
                                {currency}{(item.selling_price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-4">
                              {item.category || "Item"}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-black text-white w-5 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-zinc-700 hover:text-rose-500 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* FOOTER - Total & Checkout Trigger */}
              {cart.length > 0 && (
                <div className="px-8 py-8 border-t border-white/5 flex flex-col gap-6 bg-zinc-900/40 backdrop-blur-md shrink-0">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span className="text-white">{currency}{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      <span>Acquisition Fee</span>
                      <span className="text-emerald-500">Waived</span>
                    </div>
                    <div className="h-px bg-white/5 w-full my-2" />
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total</span>
                      <span className="text-3xl font-black text-white tracking-tighter">{currency}{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push("/checkout");
                    }}
                    className="w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Proceed to Secure Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-700 font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    End-to-End Encrypted
                  </div>
                </div>
              )}


            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
