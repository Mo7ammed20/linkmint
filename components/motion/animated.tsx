"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export function AnimatedCounter({
  value,
  duration = 1.2,
  format,
  className,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const initial = display;
    const delta = value - initial;
    let raf = 0;
    const tick = (t: number) => {
      const elapsed = (t - start) / (duration * 1000);
      if (elapsed >= 1) {
        setDisplay(value);
        return;
      }
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setDisplay(initial + delta * eased);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);
  return <span className={cn("tabular-nums", className)}>{format ? format(display) : Math.round(display).toLocaleString("en-US")}</span>;
}

export function MouseSpotlight({
  className,
  children,
  size = 360,
  color,
}: {
  className?: string;
  children: React.ReactNode;
  size?: number;
  color?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const sx = useSpring(mx, { stiffness: 200, damping: 30 });
  const sy = useSpring(my, { stiffness: 200, damping: 30 });
  const x = useTransform(sx, (v) => `${v}%`);
  const y = useTransform(sy, (v) => `${v}%`);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(((e.clientX - r.left) / r.width) * 100);
    my.set(((e.clientY - r.top) / r.height) * 100);
  }
  function onLeave() {
    mx.set(50);
    my.set(50);
  }

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={cn("relative", className)}>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(${size}px circle at ${x} ${y}, ${
            color ?? "color-mix(in oklch, var(--primary) 25%, transparent)"
          }, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}
