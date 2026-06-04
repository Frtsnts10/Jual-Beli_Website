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

  // Stripe Checkout States
  const [showStripe, setShowStripe] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [paymentStep, setPaymentStep] = useState(0); // 0 = form, 1 = loading, 2 = success
  const [loadingText, setLoadingText] = useState("");

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

  // Formatters
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length > 0 ? parts.join(" ") : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const formatCvc = (value: string) => {
    return value.replace(/[^0-9]/g, "").substring(0, 4);
  };

  const handleStripeCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
      alert("Please fill in all credit card details.");
      return;
    }

    setPaymentStep(1);
    
    // Simulate real security verification progress timeouts
    setLoadingText("Connecting to Stripe Secure API Gateway...");
    await new Promise((r) => setTimeout(r, 1200));

    setLoadingText("Authorizing credit card transaction signatures...");
    await new Promise((r) => setTimeout(r, 1200));

    setLoadingText("Finalizing system vault updates and sync...");
    await new Promise((r) => setTimeout(r, 1000));

    const storeId = process.env.NEXT_PUBLIC_STORE_ID!;
    const itemsToBuy: PurchasedProduct[] = cart.map((item) => ({
      name: item.name,
      variant: item.group_name || "Standard",
      duration_days: 30,
      bought_date: new Date().toISOString(),
      expire_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
    }));

    const result = await checkoutAction(
      storeId, 
      itemsToBuy, 
      cart.map((item) => ({ id: item.id, quantity: item.quantity }))
    );
    if (result.success) {
      setPaymentStep(2);
      await new Promise((r) => setTimeout(r, 1800));
      clearCart();
      setIsCartOpen(false);
      setShowStripe(false);
      setPaymentStep(0);
      setCardNumber("");
      setCardExpiry("");
      setCardCvc("");
      setCardName("");
      router.push("/profile");
    } else if (result.error === "Unauthenticated") {
      setShowStripe(false);
      setPaymentStep(0);
      router.push("/login");
    } else {
      alert(result.error);
      setPaymentStep(0);
    }
  };

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
              if (paymentStep !== 1) {
                setIsCartOpen(false);
                setShowStripe(false);
              }
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
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Active Vault</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                      {totalItems} {totalItems === 1 ? "artifact" : "artifacts"} secured
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
                    <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-6">Vault is empty</p>
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
                              {item.category || "Artifact"}
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
                    onClick={() => setShowStripe(true)}
                    className="w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Finalize Acquisition
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-700 font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    End-to-End Encrypted
                  </div>
                </div>
              )}

              {/* STRIPE PAYMENT OVERLAY */}
              <AnimatePresence>
                {showStripe && (
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 28, stiffness: 220 }}
                    className="absolute inset-0 bg-zinc-950 z-50 flex flex-col h-full"
                  >
                    {/* Stripe Header */}
                    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-zinc-950">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="text-xs font-black text-white uppercase tracking-widest">Stripe Secure</h2>
                          <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">Secure Gateway</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (paymentStep !== 1) setShowStripe(false);
                        }}
                        disabled={paymentStep === 1}
                        className="w-8 h-8 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                        aria-label="Back to Cart"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Stripe Content Container */}
                    <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar bg-zinc-950">
                      {paymentStep === 0 && (
                        <form onSubmit={handleStripeCheckout} className="space-y-8">
                          {/* Sandbox Banner */}
                          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/10 flex gap-3">
                            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                            <div className="text-[10px] text-zinc-400 leading-relaxed font-bold uppercase tracking-wider">
                              Sandbox Enabled. Enter any mock values to complete transaction simulation.
                            </div>
                          </div>

                          {/* Interactive Credit Card Cardholder Visualizer */}
                          <div className="relative aspect-[1.586/1] w-full rounded-2xl p-6 overflow-hidden border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.01)_100%)] shadow-xl shadow-black/40 flex flex-col justify-between">
                            {/* Card Glow ambient bubble */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

                            <div className="flex justify-between items-start">
                              {/* Chip & Contactless */}
                              <div className="w-10 h-8 rounded-md bg-zinc-700/30 border border-white/10 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-x-2 inset-y-1 border border-white/5 rounded" />
                              </div>
                              <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase">Obsidian Vault</span>
                            </div>

                            {/* Card Number */}
                            <div className="text-lg font-mono font-medium tracking-[0.25em] text-white my-4 text-center">
                              {cardNumber || "•••• •••• •••• ••••"}
                            </div>

                            {/* Card Footer Details */}
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Cardholder</p>
                                <p className="text-[10px] font-black text-white uppercase tracking-wider truncate max-w-[180px]">
                                  {cardName || "CARDHOLDER NAME"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Expires</p>
                                <p className="text-[10px] font-black text-white font-mono">{cardExpiry || "MM/YY"}</p>
                              </div>
                            </div>
                          </div>

                          {/* Structured Fields */}
                          <div className="space-y-5">
                            {/* Cardholder Name */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Cardholder Name</label>
                              <div className="relative">
                                <User className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                                <input
                                  type="text"
                                  placeholder="John Doe"
                                  value={cardName}
                                  onChange={(e) => setCardName(e.target.value)}
                                  className="w-full h-11 bg-white/[0.02] border border-white/5 rounded-xl px-11 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors uppercase font-bold tracking-wider placeholder:text-zinc-600 placeholder:normal-case placeholder:font-medium"
                                  required
                                />
                              </div>
                            </div>

                            {/* Card Number Input */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Card Number</label>
                              <div className="relative">
                                <CreditCard className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                                <input
                                  type="text"
                                  placeholder="4111 1111 1111 1111"
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                  className="w-full h-11 bg-white/[0.02] border border-white/5 rounded-xl px-11 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors font-mono tracking-wider placeholder:text-zinc-600"
                                  required
                                />
                              </div>
                            </div>

                            {/* Row of Expiry and CVC */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Expiry Date</label>
                                <div className="relative">
                                  <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                                  <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={cardExpiry}
                                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                    className="w-full h-11 bg-white/[0.02] border border-white/5 rounded-xl px-11 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors font-mono tracking-wider placeholder:text-zinc-600"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">CVC / CVV</label>
                                <div className="relative">
                                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
                                  <input
                                    type="password"
                                    placeholder="•••"
                                    value={cardCvc}
                                    onChange={(e) => setCardCvc(formatCvc(e.target.value))}
                                    className="w-full h-11 bg-white/[0.02] border border-white/5 rounded-xl px-11 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors font-mono tracking-widest placeholder:text-zinc-600"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Submit Action */}
                          <div className="pt-4 space-y-4">
                            <button
                              type="submit"
                              className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px] hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
                            >
                              Authorize {currency}{totalPrice.toLocaleString()}
                              <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowStripe(false)}
                              className="w-full h-12 rounded-2xl border border-white/10 bg-transparent text-zinc-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors cursor-pointer"
                            >
                              Cancel Acquisition
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Loading Payment verification */}
                      {paymentStep === 1 && (
                        <div className="flex flex-col items-center justify-center h-full py-28 text-center">
                          <div className="w-20 h-20 rounded-full border border-white/5 bg-white/[0.01] flex items-center justify-center relative mb-8">
                            <div className="absolute inset-0 rounded-full border-t border-indigo-500 animate-spin" />
                            <Lock className="w-8 h-8 text-indigo-400" />
                          </div>
                          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-3">Processing Transaction</h3>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest animate-pulse max-w-xs leading-relaxed">
                            {loadingText}
                          </p>
                        </div>
                      )}

                      {/* Success Verified */}
                      {paymentStep === 2 && (
                        <div className="flex flex-col items-center justify-center h-full py-28 text-center">
                          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 relative">
                            {/* Success pulsing ring */}
                            <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping opacity-75" />
                            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                          </div>
                          <h3 className="text-xl font-black text-white uppercase tracking-widest mb-3">Acquisition Verified</h3>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest max-w-xs leading-relaxed mb-8">
                            Stripe secure confirmation received. Synchronizing dynamic system nodes...
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
