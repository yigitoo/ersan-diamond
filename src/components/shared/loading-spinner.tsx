import { cn } from "@/lib/utils/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "border-2 border-slate border-t-brand-white rounded-full animate-spin",
          {
            "w-4 h-4": size === "sm",
            "w-8 h-8": size === "md",
            "w-12 h-12": size === "lg",
          }
        )}
      />
    </div>
  );
}
