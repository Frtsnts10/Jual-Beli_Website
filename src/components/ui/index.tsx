import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "obsidian";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const variants = {
      primary: "bg-white text-black hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5",
      secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10 active:scale-95",
      outline: "bg-transparent border border-white/10 text-white hover:bg-white/5 hover:border-white/20",
      ghost: "bg-transparent text-slate-500 hover:text-white hover:bg-white/5",
      obsidian: "bg-black text-white border border-white/5 hover:bg-white/5 active:scale-95 shadow-2xl",
    };

    const sizes = {
      sm: "px-4 py-2 text-[10px]",
      md: "px-6 py-3 text-xs",
      lg: "px-8 py-4 text-sm",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl font-black uppercase tracking-[0.15em] transition-all disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("glass rounded-[32px] overflow-hidden transition-all", className)}>
    {children}
  </div>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-white/30 transition-all font-medium",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
