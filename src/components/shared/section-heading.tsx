"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  accent?: boolean;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
  className?: string;
}

const sizeClasses = {
  sm: "text-2xl md:text-3xl",
  md: "text-3xl md:text-4xl lg:text-5xl",
  lg: "text-4xl md:text-5xl lg:text-6xl",
};

export function SectionHeading({
  title,
  subtitle,
  eyebrow,
  accent = false,
  size = "md",
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={cn(
        "mb-16",
        align === "center" && "text-center",
        className
      )}
    >
      {eyebrow && (
        <p className={cn("eyebrow mb-4", align === "center" && "mx-auto")}>{eyebrow}</p>
      )}
      {accent && (
        <div className={cn("section-divider mb-5", align === "center" && "section-divider--center")} />
      )}
      <h2 className={cn("luxury-heading mb-4", sizeClasses[size])}>{title}</h2>
      {subtitle && (
        <p className={cn("text-mist text-sm md:text-base max-w-2xl", align === "center" && "mx-auto")}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
