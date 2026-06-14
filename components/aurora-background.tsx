"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "low" | "medium" | "high";
  showGrid?: boolean;
  showNoise?: boolean;
}

export function AuroraBackground({
  className,
  intensity = "medium",
  showGrid = true,
  showNoise = true,
  children,
  ...props
}: AuroraBackgroundProps) {
  const opacityScale = intensity === "low" ? 0.6 : intensity === "high" ? 1.2 : 0.9;

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} {...props}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 0%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 60%)",
        }}
      />
      <div
        className="absolute -top-[10%] -left-[15%] h-[60%] w-[55%] rounded-full blur-[120px] animate-[aurora_22s_ease-in-out_infinite]"
        style={{ background: "var(--aurora-1)", opacity: opacityScale }}
      />
      <div
        className="absolute -top-[5%] -right-[15%] h-[55%] w-[50%] rounded-full blur-[140px] animate-[aurora_28s_ease-in-out_infinite_reverse]"
        style={{ background: "var(--aurora-2)", opacity: opacityScale }}
      />
      <div
        className="absolute top-[20%] left-[10%] h-[40%] w-[40%] rounded-full blur-[120px] animate-[aurora_34s_ease-in-out_infinite]"
        style={{ background: "var(--aurora-3)", opacity: opacityScale * 0.8 }}
      />
      <div
        className="absolute bottom-[-10%] right-[5%] h-[50%] w-[50%] rounded-full blur-[140px] animate-[aurora_26s_ease-in-out_infinite_reverse]"
        style={{ background: "var(--aurora-4)", opacity: opacityScale }}
      />
      {showGrid ? <div className="absolute inset-0 grid-pattern opacity-60" /> : null}
      {showNoise ? <div className="absolute inset-0 noise" /> : null}
      <div
        className="absolute inset-x-0 top-0 h-32"
        style={{
          background: "linear-gradient(to bottom, var(--background), transparent)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
