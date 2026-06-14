"use client";

import * as React from "react";
import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdZone {
  id: string;
  label: string;
  w: number;
  h: number;
  mobileHide: boolean;
  mobileOnly: boolean;
  variant: "banner" | "rectangle" | "halfpage" | "mobile";
}

export const AD_ZONES: AdZone[] = [
  { id: "zone1", label: "Leaderboard", w: 728, h: 90, mobileHide: true, mobileOnly: false, variant: "banner" },
  { id: "zone2", label: "Large Rectangle", w: 336, h: 280, mobileHide: false, mobileOnly: false, variant: "rectangle" },
  { id: "zone3", label: "Medium Rectangle", w: 300, h: 250, mobileHide: false, mobileOnly: false, variant: "rectangle" },
  { id: "zone4", label: "Half Page", w: 300, h: 600, mobileHide: false, mobileOnly: false, variant: "halfpage" },
  { id: "zone5", label: "Mobile Banner", w: 320, h: 50, mobileHide: false, mobileOnly: true, variant: "mobile" },
];

export function AdZoneById({ id, step }: { id: string; step: number }) {
  const zone = AD_ZONES.find((z) => z.id === id);
  if (!zone) return null;
  return <AdSlot zone={zone} step={step} />;
}

export function AdZones({ step }: { step: number }) {
  return (
    <div className="space-y-4">
      <AdSlot zone={AD_ZONES[0]} step={step} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
        <AdSlot zone={AD_ZONES[1]} step={step} />
        <div className="space-y-4">
          <AdSlot zone={AD_ZONES[2]} step={step} />
          <AdSlot zone={AD_ZONES[3]} step={step} />
        </div>
      </div>
      <AdSlot zone={AD_ZONES[4]} step={step} />
    </div>
  );
}

export function AdSlot({ zone, step }: { zone: AdZone; step: number }) {
  const [rendered, setRendered] = React.useState(false);
  React.useEffect(() => {
    const id = window.setTimeout(() => setRendered(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const className = cn(
    "relative flex items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/40 bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-sm",
    zone.mobileHide && "hidden md:flex",
    zone.mobileOnly && "flex md:hidden",
  );

  return (
    <div
      id={`ad-step${step + 1}-${zone.id}`}
      data-step={step + 1}
      data-zone={zone.id}
      data-size={`${zone.w}x${zone.h}`}
      className={className}
      style={{
        width: "100%",
        maxWidth: zone.w,
        height: zone.h,
        margin: "0 auto",
      }}
      aria-label={`Advertisement: ${zone.label}`}
    >
      <div className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
        <Megaphone className="h-2.5 w-2.5" />
        Ad · {zone.label} · {zone.w}×{zone.h}
      </div>
      <div className="flex flex-col items-center gap-1 px-4 text-center">
        <p className="text-xs font-medium text-muted-foreground">
          {rendered ? "Awaiting sponsor creative…" : "Loading ad slot…"}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
          {zone.w} × {zone.h} · step {step + 1}
        </p>
      </div>
    </div>
  );
}
