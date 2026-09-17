"use client";

import React, { useState } from "react";
import { useCart } from "@/features/cart/context/cart-context";
import { Button, Input, Card, Separator, Chip } from "@heroui/react";
import { PhoneInput } from "@/components/ui/phone-input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, CreditCard, Lock, ShoppingCart, ArrowLeft } from "lucide-react";

declare global {
  interface Window {
    snap: any;
  }
}

export default function CheckoutPage() {
  const { cart: items, totalPrice: total, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const router = useRouter();

  const handlePayment = async () => {
    if (!formData.name || !formData.email) return alert("Name and Email are required");
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerDetails: formData,
          orderId: `ORD-${Date.now()}`,
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
        return;
      }
      
      if (data.token) {
        window.snap.pay(data.token, {
          onSuccess: async function (result: any) {
            console.log("success", result);
            // Manually verify with the backend (since localhost webhooks usually fail)
            try {
              await fetch("/api/checkout/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: data.orderId, storeId: process.env.NEXT_PUBLIC_STORE_ID }),
              });
            } catch (e) { console.error(e); }

            clearCart();
            router.push("/profile");
          },
          onPending: function (result: any) {
            console.log("pending", result);
            alert("Waiting for payment...");
          },
          onError: function (result: any) {
            console.log("error", result);
            alert("Payment failed!");
          },
          onClose: function () {
            console.log("customer closed the popup without finishing the payment");
          }
        });
      } else {
        alert("Failed to initiate payment");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-3xl text-center">
        <h1 className="text-3xl font-bold mb-4 text-stone-900">Your Cart is Empty</h1>
        <p className="text-stone-500 mb-8">Add some items before checking out.</p>
        <Button><Link href="/products">Browse Products</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to Shopping
      </Link>

      <div className="flex flex-col items-center text-center mb-12">
        <Chip variant="soft" size="sm" className="mb-3 font-bold tracking-widest uppercase text-[10px] border-none bg-blue-50 text-blue-700">
          Secure Checkout
        </Chip>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase text-stone-900">Complete Order</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <Card className="bg-white border border-stone-200 shadow-sm">
            <div className="p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-stone-900">
                <ShieldCheck className="text-emerald-600" /> Customer Details
              </h2>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-stone-700">Full Name</label>
                <Input 
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e: any) => setFormData({...formData, name: e.target.value})}
                  required
                  color="secondary"
                /></div>
                <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-stone-700">Email Address</label>
                <Input 
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e: any) => setFormData({...formData, email: e.target.value})}
                  required
                  color="secondary"
                /></div>
                <div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-stone-700">Phone Number (Optional)</label>
                <PhoneInput 
                  value={formData.phone}
                  onChange={(val) => setFormData({...formData, phone: val})}
                /></div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="bg-white border border-stone-200 shadow-sm sticky top-24">
            <div className="p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-stone-900">
                <ShoppingCart className="text-primary" /> Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-bold text-sm line-clamp-2 text-stone-900">{item.name}</p>
                      <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold whitespace-nowrap text-stone-900">
                      Rp {(item.selling_price * item.quantity).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="bg-stone-200 my-6" />

              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-stone-500 text-sm">
                  <span>Subtotal</span>
                  <span>Rp {total.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-stone-500 text-sm">
                  <span>Tax & Fees</span>
                  <span>Calculated at payment</span>
                </div>
                <div className="flex justify-between text-xl font-black text-stone-900 mt-4 pt-4 border-t border-stone-200">
                  <span>Total</span>
                  <span>Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <Button
                className="w-full font-black uppercase tracking-widest bg-primary text-white"
                onPress={handlePayment}
              >
                {isLoading ? "Processing..." : "Pay with Midtrans"}
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 text-stone-500 text-xs font-medium">
                <CreditCard size={14} /> Payments are processed securely
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
