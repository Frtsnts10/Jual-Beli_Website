"use client";

import React from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { CartButton } from "@/features/cart/components/cart-button";
import { Button, Tooltip, TooltipTrigger, TooltipContent } from "@heroui/react";

interface NavbarProps {
  user: any;
  storeName: string;
}

export function Navbar({ user, storeName }: NavbarProps) {
  const initial = storeName[0]?.toUpperCase() || "S";

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-50">
      <div className="flex items-center h-14 px-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl shadow-black/80">

        {/* Brand — fixed width so center doesn't shift */}
        <Link href="/" className="flex items-center gap-3 shrink-0 w-44">
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-black text-sm shrink-0">
            {initial}
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-[11px] tracking-widest uppercase text-white">
              {storeName.split(" ")[0]}
            </span>
            <span className="font-semibold text-[9px] tracking-widest uppercase text-zinc-500">
              {storeName.split(" ").slice(1).join(" ") || "Storefront"}
            </span>
          </div>
        </Link>

        {/* Center Nav Links — flex-1 + flex justify-center so it truly centers */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-8">
          {[
            { label: "Featured", href: "/#featured" },
            { label: "Collection", href: "/#collection" },
            { label: "Groups", href: "/#groups" },
            { label: "Reviews", href: "/#reviews" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[10px] font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions — fixed width matching left brand so center is truly centered */}
        <div className="flex items-center justify-end gap-3 shrink-0 w-44">
          {user ? (
            <Tooltip>
              <TooltipTrigger>
                <Link href="/profile">
                  <Button
                    isIconOnly
                    variant="outline"
                    size="sm"
                    className="border-white/10 bg-white/5 text-zinc-400 hover:text-white rounded-xl w-8 h-8 min-w-0"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-900 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white px-3 py-1.5 rounded-lg">
                Profile
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest px-3"
              >
                Sign In
              </Button>
            </Link>
          )}
          <div className="w-px h-5 bg-white/10" />
          <CartButton />
        </div>

      </div>
    </div>
  );
}
