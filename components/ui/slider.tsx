"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (v: number[]) => void;
}

export function Slider({ value, min = 0, max = 100, step = 1, onValueChange, className, ...props }: SliderProps) {
  const dragging = React.useRef(false);
  const v = value[0] ?? min;
  const pct = ((v - min) / (max - min)) * 100;
  const ref = React.useRef<HTMLDivElement>(null);

  function update(clientX: number) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const p = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
    const raw = min + p * (max - min);
    const next = Math.round(raw / step) * step;
    const clamped = Math.min(Math.max(next, min), max);
    onValueChange?.([clamped]);
  }

  return (
    <div
      ref={ref}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={v}
      tabIndex={0}
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        update(e.clientX);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        update(e.clientX);
      }}
      onPointerUp={(e) => {
        dragging.current = false;
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {}
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          onValueChange?.([Math.max(v - step, min)]);
        } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          onValueChange?.([Math.min(v + step, max)]);
        }
      }}
      className={cn(
        "group relative flex h-5 w-full touch-none select-none items-center",
        className,
      )}
      {...props}
    >
      <div className="relative h-1.5 w-full rounded-full bg-secondary">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary to-accent"
          style={{ width: `${pct}%` }}
        />
      </div>
      <motion.div
        className="absolute h-4 w-4 rounded-full border-2 border-primary bg-background shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary)_15%,transparent)]"
        style={{ left: `calc(${pct}% - 8px)` }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      />
    </div>
  );
}
