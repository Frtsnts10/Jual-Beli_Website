"use client";

import React from "react";
import { ShoppingBag, ChevronDown, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, Separator } from "@heroui/react";

interface OrderPipelineQueueProps {
  orders: any[];
}

function formatDateTime(dateInput: string | Date) {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${month} ${day}, ${year} at ${hours}:${minutes} ${ampm}`;
}

export function OrderPipelineQueue({ orders }: OrderPipelineQueueProps) {
  const [expandedOrderId, setExpandedOrderId] = React.useState<string | null>(null);

  if (!orders || orders.length === 0) return null;

  return (
    <div className="space-y-10 mb-20">
      {/* Header */}
      <div className="flex items-center gap-6">
        <h2 className="text-2xl font-black text-stone-900 uppercase tracking-widest shrink-0">Active Orders</h2>
        <Separator className="bg-stone-200 hidden md:block" />
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Live Updates</span>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const dateStr = formatDateTime(order.created_at);

          // Compute steps progress
          const isPaid = order.payment_status === "paid";
          const isFulfilled = order.fulfillment_status === "fulfilled";
          const isCancelled = order.fulfillment_status === "cancelled";

          return (
            <Card
              key={order.id}
              className="bg-white border border-stone-200 shadow-sm rounded-3xl overflow-hidden transition-all duration-300"
            >
              {/* Row Header */}
              <div
                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                      Order #{order.id.startsWith("ORD-") ? order.id.slice(4) : order.id}
                    </h4>
                    <p className="text-[10px] text-stone-500 mt-1 font-mono">{dateStr}</p>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Status Steps */}
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-stone-500">Payment:</span>
                    <span className={isPaid ? "text-emerald-600" : "text-amber-600"}>
                      {order.payment_status}
                    </span>
                    <span className="text-stone-300">|</span>
                    <span className="text-stone-500">Fulfillment:</span>
                    <span className={isFulfilled ? "text-emerald-600" : isCancelled ? "text-rose-600" : "text-amber-600 animate-pulse"}>
                      {isFulfilled ? "Completed" : isCancelled ? "Cancelled" : "Preparing Delivery"}
                    </span>
                  </div>

                  <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Collapsed steps & items details */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-4 border-t border-stone-200 bg-stone-50 space-y-6">
                  {/* Progress Timeline Tracker */}
                  <div className="p-4 bg-white border border-stone-200 rounded-2xl">
                    <p className="text-[9px] text-stone-500 font-black uppercase tracking-widest mb-4">Order Status Tracking</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Step 1: Payment Verification */}
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isPaid ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                          {isPaid ? <CheckCircle className="w-3.5 h-3.5" /> : "1"}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-stone-900">1. Payment Verified</p>
                          <p className="text-[9px] text-stone-500 mt-0.5">
                            {isPaid ? "Your payment has been successfully processed." : "Awaiting payment confirmation."}
                          </p>
                        </div>
                      </div>

                      {/* Step 2: Credential Allocation */}
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          isFulfilled
                            ? "bg-emerald-50 text-emerald-700"
                            : isCancelled
                            ? "bg-rose-50 text-rose-600"
                            : "bg-amber-50 text-amber-600 animate-pulse"
                        }`}>
                          {isFulfilled ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : isCancelled ? (
                            <AlertCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-stone-900">2. Delivery & Activation</p>
                          <p className="text-[9px] text-stone-500 mt-0.5">
                            {isFulfilled
                              ? "Your account credentials have been successfully delivered."
                              : isCancelled
                              ? "Fulfillment terminated."
                              : "Preparing your digital products for delivery..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items included */}
                  <div>
                    <p className="text-[9px] text-stone-500 font-black uppercase tracking-widest mb-3">Order Items</p>
                    <div className="divide-y divide-stone-200">
                      {order.items.map((item: any, itemIdx: number) => (
                        <div key={itemIdx} className="py-3 flex items-center justify-between gap-4 text-xs">
                          <div>
                            <span className="font-extrabold text-stone-900 uppercase tracking-wider">{item.name}</span>
                            <span className="ml-2 text-[8px] bg-stone-100 border border-stone-200 text-stone-500 font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest">
                              {item.variant}
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-500 font-bold">{item.duration_days} Days Access Pass</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
