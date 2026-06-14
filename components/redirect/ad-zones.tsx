"use client";

import * as React from "react";

interface AdZone {
  id: string;
  label: string;
  w: number;
  h: number;
  mobileHide: boolean;
  mobileOnly: boolean;
}

const AD_ZONES: AdZone[] = [
  { id: "zone1", label: "Leaderboard 728×90", w: 728, h: 90, mobileHide: true, mobileOnly: false },
  { id: "zone2", label: "Large Rectangle 336×280", w: 336, h: 280, mobileHide: false, mobileOnly: false },
  { id: "zone3", label: "Medium Rectangle 300×250", w: 300, h: 250, mobileHide: false, mobileOnly: false },
  { id: "zone4", label: "Half Page 300×600", w: 300, h: 600, mobileHide: false, mobileOnly: false },
  { id: "zone5", label: "Mobile Banner 320×50", w: 320, h: 50, mobileHide: false, mobileOnly: true },
];

export function AdZones({ step }: { step: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_336px]">
      <div className="space-y-4">
        {AD_ZONES.filter((z) => z.id === "zone1" || z.id === "zone5").map((z) => (
          <AdSlot key={z.id} zone={z} step={step} />
        ))}
      </div>
      <div className="space-y-4">
        {AD_ZONES.filter((z) => z.id === "zone2" || z.id === "zone3" || z.id === "zone4").map((z) => (
          <AdSlot key={z.id} zone={z} step={step} />
        ))}
      </div>
    </div>
  );
}

function AdSlot({ zone, step }: { zone: AdZone; step: number }) {
  const className = [
    "flex items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border/60 bg-card/30 backdrop-blur-sm",
    zone.mobileHide ? "hidden md:flex" : "",
    zone.mobileOnly ? "flex md:hidden" : "",
  ]
    .filter(Boolean)
    .join(" ");

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
        borderRadius: 12,
      }}
      aria-label={`Advertisement: ${zone.label}`}
    >
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{zone.label}</span>
    </div>
  );
}
