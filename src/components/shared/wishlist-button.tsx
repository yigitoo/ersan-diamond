"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useWishlist } from "@/lib/wishlist/wishlist-context";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: number;
}

export function WishlistButton({ productId, className, size = 18 }: WishlistButtonProps) {
  const { has, toggle, mounted } = useWishlist();
  const inWishlist = mounted && has(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(productId);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "p-2 rounded-full transition-all duration-300",
        inWishlist
          ? "text-red-400 bg-red-500/20 backdrop-blur-sm"
          : "text-white/80 hover:text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm",
        className
      )}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={size}
        strokeWidth={1.5}
        fill={inWishlist ? "currentColor" : "none"}
      />
    </button>
  );
}
