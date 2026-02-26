import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  variant?: "horizontal" | "square";
  className?: string;
  width?: number;
  height?: number;
  link?: boolean;
}

export function Logo({ variant = "horizontal", className, width, height, link = true }: LogoProps) {
  const src = variant === "horizontal" ? "/imgs/logo-horizontal.png" : "/imgs/logo-square.png";
  const defaultWidth = variant === "horizontal" ? 180 : 60;
  const defaultHeight = variant === "horizontal" ? 71 : 60;

  const img = (
    <Image
      src={src}
      alt="Ersan Diamond"
      width={width || defaultWidth}
      height={height || defaultHeight}
      className={cn("object-contain", className)}
      priority
    />
  );

  if (link) {
    return <Link href="/">{img}</Link>;
  }

  return img;
}
