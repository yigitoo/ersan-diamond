"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium tracking-wider uppercase text-mist">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={inputId}
            ref={ref}
            className={cn(
              "w-full appearance-none bg-transparent border-b border-slate px-0 py-3 pr-8 text-brand-white",
              "transition-colors duration-300 focus:border-brand-white focus:outline-none",
              error && "border-red-500",
              className
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-charcoal text-brand-white">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-mist pointer-events-none" />
        </div>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
