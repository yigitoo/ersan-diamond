"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface TabsProps {
  tabs: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex border-b border-slate", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "px-4 py-3 text-sm font-medium tracking-wider uppercase transition-colors relative",
            value === tab.value
              ? "text-brand-white"
              : "text-mist hover:text-brand-white"
          )}
        >
          {tab.label}
          {value === tab.value && (
            <span className="absolute bottom-0 left-0 right-0 h-px bg-brand-white" />
          )}
        </button>
      ))}
    </div>
  );
}
