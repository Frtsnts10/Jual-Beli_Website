"use client";

import { useCartStore } from "../store";
import { Button } from "@heroui/react";
import { X, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity } = useCartStore();
  
  const totalPrice = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const cartCurrency = items.length > 0 ? items[0].product.currency : "USD";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-[100]"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-neutral-900 border-l border-neutral-800 shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-xl font-semibold flex items-center">
                <ShoppingBag className="w-5 h-5 mr-3 text-blue-500" />
                Your Cart
              </h2>
              <Button isIconOnly variant="ghost" onPress={() => setIsOpen(false)} aria-label="Close cart">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-4">
                  <ShoppingBag className="w-12 h-12 opacity-20" />
                  <p>Your cart is empty.</p>
                  <Button variant="primary" onPress={() => setIsOpen(false)}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl bg-neutral-800 overflow-hidden flex-shrink-0">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-sm line-clamp-1">{item.product.name}</h3>
                        <span className="font-semibold text-sm">
                          {new Intl.NumberFormat('en-US', { 
                            style: 'currency', 
                            currency: item.product.currency,
                            maximumFractionDigits: item.product.currency === 'IDR' ? 0 : 2
                          }).format(item.product.price * item.quantity)}
                        </span>
                      </div>
                      <p className="text-neutral-500 text-xs mb-3">Qty: {item.quantity}</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center border border-neutral-700 rounded-lg overflow-hidden bg-neutral-950">
                          <button 
                            className="px-2 py-1 text-neutral-400 hover:text-neutral-50 transition-colors"
                            onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          >
                            -
                          </button>
                          <span className="text-xs px-2">{item.quantity}</span>
                          <button 
                            className="px-2 py-1 text-neutral-400 hover:text-neutral-50 transition-colors"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.product.id)}
                          className="text-neutral-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-neutral-800 bg-neutral-950/50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-neutral-400 font-medium">Subtotal</span>
                  <span className="text-xl font-bold">
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: cartCurrency,
                      maximumFractionDigits: cartCurrency === 'IDR' ? 0 : 2
                    }).format(totalPrice)}
                  </span>
                </div>
                <Link href="/checkout" onClick={() => setIsOpen(false)} className="w-full block">
                  <Button size="lg" variant="primary" className="w-full font-semibold rounded-xl h-14">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
