"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function GradientText({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("text-gradient bg-clip-text text-transparent", className)}
      {...props}
    >
      {children}
    </span>
  );
}
