"use client";

import React, { useState } from "react";
import { Star, CheckCircle, MessageSquare, Plus, Send } from "lucide-react";
import { Card, Separator, Button, Chip } from "@heroui/react";
import { FormInput } from "@/components/ui/form-input";

interface Review {
  id: number;
  name: string;
  handle: string;
  rating: number;
  badge: string;
  product: string;
  comment: string;
  avatarBg: string;
  initials: string;
  date: string;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: 1,
    name: "Alex Rivera",
    handle: "@rivera.sec",
    rating: 5,
    badge: "Verified Operator",
    product: "Netflix Shared Premium",
    comment: "Incredibly smooth account allocation. The shard was delivered to my profile dashboard instantly. Cleanest interface I have ever experienced.",
    avatarBg: "from-indigo-500 to-blue-600",
    initials: "AR",
    date: "2 days ago"
  },
  {
    id: 2,
    name: "Sophia Chen",
    handle: "@soph.dev",
    rating: 5,
    badge: "Enterprise Node",
    product: "Spotify Family Pool",
    comment: "The Access Key Vault is absolute perfection. Copy-pasting works perfectly, and my shared family profile slot has been running operational with zero interruptions for 3 months.",
    avatarBg: "from-emerald-400 to-teal-600",
    initials: "SC",
    date: "1 week ago"
  },
  {
    id: 3,
    name: "Marcus Vance",
    handle: "@vance.eth",
    rating: 5,
    badge: "Beta Protocol",
    product: "Netflix Solo Ultra",
    comment: "Outstanding delivery performance. I received the credentials pass within seconds of payment verification. This storefront is set in a class of its own.",
    avatarBg: "from-amber-400 to-rose-600",
    initials: "MV",
    date: "3 weeks ago"
  }
];

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [product, setProduct] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment || !product) return;

    const newReview: Review = {
      id: Date.now(),
      name,
      handle: `@${name.toLowerCase().replace(/\s+/g, "")}.node`,
      rating,
      badge: "Verified Operator",
      product,
      comment,
      avatarBg: "from-purple-500 to-indigo-600",
      initials: name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
      date: "Just now"
    };

    setReviews([newReview, ...reviews]);
    setName("");
    setComment("");
    setProduct("");
    setShowForm(false);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-28 relative">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
        
        {/* Left Column: Aggregated Rating & Write a Review */}
        <div className="space-y-8 lg:sticky lg:top-28">
          <div>
            <Chip
              variant="soft"
              size="sm"
              className="bg-indigo-500/10 text-indigo-400 border-none text-[10px] font-bold tracking-widest uppercase mb-3"
            >
              Feedback Logs
            </Chip>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">Operator Hub</h2>
            <p className="text-zinc-500 text-xs mt-3 uppercase tracking-wider font-bold">
              Real-time transaction and terminal stability logs.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm space-y-6">
            {/* Display Average Rating */}
            <div className="flex items-center gap-6">
              <span className="text-6xl font-black text-white tracking-tighter">4.9</span>
              <div>
                <div className="flex gap-1 text-amber-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4.5 h-4.5 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                  Based on {reviews.length + 2450} Shards
                </span>
              </div>
            </div>

            <Separator className="bg-white/5" />

            {!showForm ? (
              <Button
                onPress={() => setShowForm(true)}
                className="w-full h-12 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Write Protocol Review
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">Deploy Review Log</p>
                
                {/* Interactive Stars Selection */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="text-amber-400 focus:outline-none transition-transform active:scale-95"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= (hoverRating ?? rating) ? "fill-current" : "text-zinc-700"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <FormInput
                  label="OPERATOR NAME"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jean Doe"
                  required
                />

                <FormInput
                  label="ACQUIRED SHARD / PRODUCT"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="e.g. Netflix Solo Ultra"
                  required
                />

                <div className="flex flex-col gap-3 w-full group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-white transition-colors">
                    FEEDBACK LOG COMMENT
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe your account performance..."
                    className="w-full min-h-[100px] bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white placeholder:text-slate-800 focus:border-indigo-500 focus:bg-white/[0.05] focus:outline-none transition-all duration-300"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[9px] rounded-xl transition-all gap-2"
                  >
                    <Send className="w-3.5 h-3.5" /> Deploy
                  </Button>
                  <Button
                    type="button"
                    onPress={() => setShowForm(false)}
                    className="h-11 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white font-black uppercase tracking-widest text-[9px] rounded-xl transition-all"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Columns: Deployed Reviews Stream */}
        <div className="lg:col-span-2 space-y-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-zinc-900/30 border border-white/5 hover:border-white/12 p-8 rounded-3xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm flex flex-col gap-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                {/* User Details */}
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${review.avatarBg} text-white font-black flex items-center justify-center text-xs shrink-0`}>
                    {review.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">{review.name}</h4>
                      <div className="flex items-center gap-1.5 text-[8px] bg-indigo-500/10 text-indigo-400 font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                        <CheckCircle className="w-2.5 h-2.5" /> {review.badge}
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-1.5 font-mono">{review.handle}</p>
                  </div>
                </div>

                {/* Rating display */}
                <div className="flex flex-col sm:items-end gap-2">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{review.date}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest leading-none">Bounded Shard:</span>
                  <span className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-widest">{review.product}</span>
                </div>
                <p className="text-zinc-300 text-xs font-medium leading-relaxed font-sans">
                  "{review.comment}"
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
