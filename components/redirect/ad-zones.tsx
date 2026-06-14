"use client";

import * as React from "react";
import { Megaphone, Code2, Eye, EyeOff, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdZone {
  id: string;
  label: string;
  width: number;
  height: number;
  position?: string;
  global?: boolean;
}

export const AD_ZONES: AdZone[] = [
  { id: "zone1", label: "Leaderboard", width: 728, height: 90, position: "Top banner" },
  { id: "zone2", label: "Large Rectangle", width: 336, height: 280, position: "Right column · top" },
  { id: "zone3", label: "Medium Rectangle", width: 300, height: 250, position: "Left column · under countdown" },
  { id: "zone4", label: "Half Page", width: 300, height: 600, position: "Right column · bottom" },
  { id: "zone5", label: "Mobile Banner", width: 320, height: 50, position: "Bottom strip · mobile only" },
  { id: "zone6", label: "Wide Skyscraper", width: 160, height: 600, position: "Sidebar · alternate" },
  { id: "zone7", label: "Pop-under", width: 0, height: 0, position: "Global · fires on redirect", global: true },
  { id: "zone8", label: "Social Bar", width: 0, height: 0, position: "Global · top/bottom bar", global: true },
];

interface PlacementData {
  code: string;
  active: boolean;
}

const placementCache = new Map<string, PlacementData>();

async function fetchPlacement(zoneId: string): Promise<PlacementData> {
  if (placementCache.has(zoneId)) {
    return placementCache.get(zoneId)!;
  }
  try {
    const res = await fetch(`/api/ads/placements`, { cache: "no-store" });
    if (!res.ok) {
      placementCache.set(zoneId, { code: "", active: false });
      return { code: "", active: false };
    }
    const data = (await res.json()) as {
      zones: Record<string, { code: string; active: boolean }>;
    };
    const all = data.zones ?? {};
    for (const id of Object.keys(all)) {
      placementCache.set(id, { code: all[id].code, active: all[id].active });
    }
    if (placementCache.has(zoneId)) {
      return placementCache.get(zoneId)!;
    }
  } catch {
  }
  placementCache.set(zoneId, { code: "", active: false });
  return { code: "", active: false };
}

export function clearAdPlacementCache(): void {
  placementCache.clear();
}

export function AdZoneById({ id, step }: { id: string; step: number }) {
  const zone = AD_ZONES.find((z) => z.id === id);
  if (!zone) return null;
  if (zone.global) return <GlobalAdSlot zone={zone} step={step} />;
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
  const [placement, setPlacement] = React.useState<PlacementData>({ code: "", active: true });
  const [status, setStatus] = React.useState<"loading" | "loaded" | "empty" | "error">("loading");
  const codeHostRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    const id = window.setTimeout(async () => {
      const data = await fetchPlacement(zone.id);
      if (cancelled) return;
      setPlacement(data);
      if (!data.active || !data.code.trim()) {
        setStatus("empty");
      } else {
        setStatus("loaded");
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [zone.id]);

  React.useEffect(() => {
    if (status !== "loaded") return;
    const host = codeHostRef.current;
    if (!host) return;
    host.innerHTML = placement.code;
    const scripts = Array.from(host.querySelectorAll("script"));
    scripts.forEach((old) => {
      const fresh = document.createElement("script");
      for (const attr of Array.from(old.attributes)) {
        fresh.setAttribute(attr.name, attr.value);
      }
      if (!old.src && old.textContent) {
        fresh.text = old.textContent;
      }
      old.parentNode?.replaceChild(fresh, old);
    });
  }, [status, placement.code, step]);

  const showCode = status === "loaded" && placement.code.trim().length > 0;

  return (
    <div
      id={`ad-step${step + 1}-${zone.id}`}
      data-step={step + 1}
      data-zone={zone.id}
      data-size={`${zone.width}x${zone.height}`}
      data-status={status}
      data-ad-loaded={showCode ? "1" : "0"}
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-dashed bg-gradient-to-br backdrop-blur-sm",
        showCode
          ? "border-primary/20 from-card/40 to-card/20"
          : "border-primary/40 from-card/60 to-card/30",
      )}
      style={{
        width: "100%",
        maxWidth: zone.width || undefined,
        height: zone.height || undefined,
        minHeight: zone.width === 0 ? undefined : 90,
        margin: "0 auto",
      }}
      aria-label={`Advertisement: ${zone.label}`}
    >
      <div className="pointer-events-none absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
        <Megaphone className="h-2.5 w-2.5" />
        Ad · {zone.label} · {zone.width ? `${zone.width}×${zone.height}` : "Global"}
        {status === "loaded" ? (
          <span className="ml-1 inline-flex items-center gap-0.5 text-success">
            <Eye className="h-2.5 w-2.5" /> live
          </span>
        ) : status === "empty" ? (
          <span className="ml-1 inline-flex items-center gap-0.5 text-warning">
            <EyeOff className="h-2.5 w-2.5" /> empty
          </span>
        ) : status === "error" ? (
          <span className="ml-1 inline-flex items-center gap-0.5 text-destructive">
            <Code2 className="h-2.5 w-2.5" /> error
          </span>
        ) : (
          <span className="ml-1 inline-flex items-center gap-0.5 text-muted-foreground">
            <RefreshCcw className="h-2.5 w-2.5 animate-spin" /> loading
          </span>
        )}
      </div>
      <div ref={codeHostRef} className="h-full w-full" />
      {!showCode ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center">
          <p className="text-xs font-medium text-muted-foreground">
            {status === "loading"
              ? "Loading ad placement…"
              : status === "empty"
                ? "No ad code configured for this zone"
                : "Failed to load ad placement"}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
            {zone.width ? `${zone.width} × ${zone.height}` : "Global"} · {zone.label}
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            Edit at <code className="rounded bg-card/60 px-1">/admin/ads</code> or{" "}
            <code className="rounded bg-card/60 px-1">ads.txt</code>
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function GlobalAdSlot({ zone, step }: { zone: AdZone; step: number }) {
  const [placement, setPlacement] = React.useState<PlacementData>({ code: "", active: true });
  const [status, setStatus] = React.useState<"loading" | "loaded" | "empty">("loading");
  const hostRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    const id = window.setTimeout(async () => {
      const data = await fetchPlacement(zone.id);
      if (cancelled) return;
      setPlacement(data);
      if (!data.active || !data.code.trim()) {
        setStatus("empty");
      } else {
        setStatus("loaded");
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [zone.id]);

  React.useEffect(() => {
    if (status !== "loaded") return;
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = placement.code;
    const scripts = Array.from(host.querySelectorAll("script"));
    scripts.forEach((old) => {
      const fresh = document.createElement("script");
      for (const attr of Array.from(old.attributes)) {
        fresh.setAttribute(attr.name, attr.value);
      }
      if (!old.src && old.textContent) {
        fresh.text = old.textContent;
      }
      old.parentNode?.replaceChild(fresh, old);
    });
  }, [status, placement.code, step]);

  return (
    <div
      id={`ad-step${step + 1}-${zone.id}`}
      data-step={step + 1}
      data-zone={zone.id}
      data-size="global"
      data-status={status}
      data-ad-loaded={status === "loaded" ? "1" : "0"}
      className="hidden"
      aria-hidden="true"
    >
      <div ref={hostRef} />
    </div>
  );
}

export function GlobalAdSlots({ step }: { step: number }) {
  return (
    <>
      <GlobalAdSlot zone={AD_ZONES[6]} step={step} />
      <GlobalAdSlot zone={AD_ZONES[7]} step={step} />
    </>
  );
}
