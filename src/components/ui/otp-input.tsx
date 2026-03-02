"use client";

import { useRef, useCallback, ClipboardEvent, KeyboardEvent, ChangeEvent } from "react";
import { cn } from "@/lib/utils/cn";

interface OtpInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
}

export function OtpInput({ length = 6, value, onChange, onComplete, disabled }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = useCallback((index: number) => {
    const input = inputsRef.current[index];
    if (input) {
      input.focus();
      input.select();
    }
  }, []);

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;

    const digit = val.slice(-1);
    const newValue = [...value];
    newValue[index] = digit;
    onChange(newValue);

    // Auto-focus next
    if (index < length - 1) {
      focusInput(index + 1);
    }

    // Auto-submit
    if (newValue.every((d) => d !== "") && onComplete) {
      onComplete(newValue.join(""));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newValue = [...value];
      if (newValue[index]) {
        newValue[index] = "";
        onChange(newValue);
      } else if (index > 0) {
        newValue[index - 1] = "";
        onChange(newValue);
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const digits = text.replace(/\D/g, "").slice(0, length).split("");
    if (digits.length === 0) return;

    const newValue = [...value];
    digits.forEach((d, i) => {
      newValue[i] = d;
    });
    onChange(newValue);

    // Focus the next empty or last
    const nextEmpty = newValue.findIndex((d) => d === "");
    focusInput(nextEmpty >= 0 ? nextEmpty : length - 1);

    // Auto-submit
    if (newValue.every((d) => d !== "") && onComplete) {
      onComplete(newValue.join(""));
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className={cn(
            "w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-mono font-semibold",
            "bg-charcoal border-2 border-slate rounded-sm text-brand-white",
            "focus:outline-none focus:border-brand-gold transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "placeholder:text-slate"
          )}
          placeholder="·"
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}
