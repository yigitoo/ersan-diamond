"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "luxury-btn inline-flex items-center justify-center transition-all duration-500",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-gold",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-brand-white text-brand-black hover:bg-soft-white": variant === "primary",
            "bg-charcoal text-brand-white hover:bg-slate": variant === "secondary",
            "border border-soft-white/20 text-brand-white hover:border-brand-white hover:bg-brand-white/5": variant === "outline",
            "text-brand-white hover:text-brand-gold": variant === "ghost",
            "bg-brand-gold text-brand-black hover:bg-brand-gold/90": variant === "gold",
          },
          {
            "px-4 py-2 text-xs": size === "sm",
            "px-6 py-3 text-sm": size === "md",
            "px-8 py-4 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, type ButtonProps };
