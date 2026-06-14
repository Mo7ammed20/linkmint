"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Marquee({
  className,
  children,
  reverse = false,
  speed = 40,
  pauseOnHover = true,
}: {
  className?: string;
  children: React.ReactNode;
  reverse?: boolean;
  speed?: number;
  pauseOnHover?: boolean;
}) {
  return (
    <div
      className={cn(
        "group flex w-full overflow-hidden",
        pauseOnHover && "[&:hover_.marquee-track]:[animation-play-state:paused]",
        className,
      )}
      style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
    >
      <div
        className="marquee-track flex shrink-0 gap-8 pr-8"
        style={{
          animation: `marquee ${speed}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
