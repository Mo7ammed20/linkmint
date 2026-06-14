"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export function Magnetic({
  children,
  className,
  strength = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 200, damping: 20, mass: 0.5 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const rx = e.clientX - (r.left + r.width / 2);
    const ry = e.clientY - (r.top + r.height / 2);
    x.set(rx * strength);
    y.set(ry * strength);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={cn("inline-flex", className)} style={{ x: sx, y: sy }}>
      {children}
    </motion.div>
  );
}

export function Tilt3D({
  children,
  className,
  max = 8,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sRx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sRy = useSpring(ry, { stiffness: 200, damping: 20 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    rx.set(((e.clientY - (r.top + r.height / 2)) / r.height) * -max);
    ry.set(((e.clientX - (r.left + r.width / 2)) / r.width) * max);
  }
  function onLeave() {
    rx.set(0);
    ry.set(0);
  }
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("relative will-change-transform", className)}
      style={{ rotateX: sRx, rotateY: sRy, transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}

export function GlowCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const ref = React.useRef<HTMLDivElement>(null);
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    ref.current?.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    ref.current?.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  }
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-card/60",
        className,
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(600px circle at var(--mx,50%) var(--my,50%), color-mix(in oklch, var(--primary) 12%, transparent), transparent 50%)",
        }}
      />
      {children}
    </div>
  );
}
