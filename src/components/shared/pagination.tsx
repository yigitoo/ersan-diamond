"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 text-mist hover:text-brand-white disabled:opacity-30 transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="text-sm text-mist">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 text-mist hover:text-brand-white disabled:opacity-30 transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
