"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  showWordmark?: boolean;
  size?: number;
}

export function Logo({ className, showWordmark = true, size = 28, ...props }: LogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)} {...props}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <defs>
            <linearGradient id="lm-grad-1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="oklch(0.7 0.22 280)" />
              <stop offset="50%" stopColor="oklch(0.7 0.22 230)" />
              <stop offset="100%" stopColor="oklch(0.78 0.22 320)" />
            </linearGradient>
            <linearGradient id="lm-grad-2" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="oklch(0.78 0.22 320)" />
              <stop offset="100%" stopColor="oklch(0.7 0.22 280)" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="28" height="28" rx="9" fill="url(#lm-grad-1)" />
          <path
            d="M11 21V11a4 4 0 0 1 8 0v6"
            stroke="white"
            strokeOpacity="0.95"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="19" cy="18" r="2.6" fill="white" />
        </svg>
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-[inherit] opacity-60 blur-md"
          style={{ background: "linear-gradient(135deg, oklch(0.7 0.22 280), oklch(0.78 0.22 320))" }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      {showWordmark ? (
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight">
            link<span className="text-gradient">mint</span>
          </span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            monetize every click
          </span>
        </div>
      ) : null}
    </div>
  );
}
