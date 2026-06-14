"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Save,
  RefreshCcw,
  Eye,
  EyeOff,
  Code2,
  Copy,
  Check,
  Megaphone,
  Download,
  FileCode,
  Power,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ZONES = [
  { id: "zone1", label: "Leaderboard", size: "728×90", position: "Top banner" },
  { id: "zone2", label: "Large Rectangle", size: "336×280", position: "Right column · top" },
  { id: "zone3", label: "Medium Rectangle", size: "300×250", position: "Left column · under countdown" },
  { id: "zone4", label: "Half Page", size: "300×600", position: "Right column · bottom" },
  { id: "zone5", label: "Mobile Banner", size: "320×50", position: "Bottom strip · mobile only" },
  { id: "zone6", label: "Wide Skyscraper", size: "160×600", position: "Sidebar · alternate" },
  { id: "zone7", label: "Pop-under", size: "Global", position: "Fires on redirect" },
  { id: "zone8", label: "Social Bar", size: "Global", position: "Top/bottom bar" },
] as const;

type ZoneId = (typeof ZONES)[number]["id"];

interface Placement {
  zoneId: string;
  label: string;
  width: number;
  height: number;
  code: string;
  active: boolean;
  notes: string;
  updatedAt: string;
}

export function AdminAds() {
  const [placements, setPlacements] = React.useState<Partial<Record<ZoneId, Placement>>>({});
  const [loading, setLoading] = React.useState(true);
  const [seeding, setSeeding] = React.useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/ads/placements?all=1", { cache: "no-store" });
      const data = (await res.json()) as { zones: Record<string, Placement> };
      const map: Partial<Record<ZoneId, Placement>> = {};
      for (const z of ZONES) {
        const existing = data.zones?.[z.id];
        if (existing) {
          map[z.id] = existing;
        } else {
          map[z.id] = {
            zoneId: z.id,
            label: z.label,
            width: Number(z.size.split("×")[0]),
            height: Number(z.size.split("×")[1]),
            code: "",
            active: false,
            notes: "",
            updatedAt: new Date().toISOString(),
          };
        }
      }
      setPlacements(map);
    } catch (e) {
      toast.error("Failed to load placements", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  async function seed() {
    setSeeding(true);
    try {
      const res = await fetch("/api/ads/seed", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Seed failed");
      }
      toast.success("Seeded from config/ads.txt", {
        description: "All zones populated from the file.",
      });
      await load();
    } catch (e) {
      toast.error("Seed failed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setSeeding(false);
    }
  }

  async function save(zoneId: ZoneId, patch: Partial<Placement>) {
    const current = placements[zoneId];
    if (!current) return;
    const next: Placement = { ...current, ...patch };
    setPlacements((p) => ({ ...p, [zoneId]: next }));
    try {
      const res = await fetch(`/api/ads/placements/${zoneId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          code: next.code,
          active: next.active,
          notes: next.notes,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Save failed");
      }
      const data = (await res.json()) as { placement: Placement };
      setPlacements((p) => ({ ...p, [zoneId]: data.placement }));
      toast.success(`${current.label} saved`, {
        description: "Live on the redirect page now.",
      });
    } catch (e) {
      toast.error("Save failed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  const totalActive = Object.values(placements).filter((p) => p?.active && p.code.trim().length > 0).length;
  const totalCode = Object.values(placements).reduce((acc, p) => acc + (p?.code.length ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" />
            Ad placement manager
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Redirect-page ad zones</h2>
          <p className="text-sm text-muted-foreground">
            Paste the ad code from your network under each zone. Live on{" "}
            <code className="rounded bg-card/60 px-1.5 py-0.5 font-mono text-xs">/r/[code]</code>{" "}
            instantly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="glass" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCcw className={cn(loading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void seed()}
            disabled={seeding}
            title="Read config/ads.txt and populate the database"
          >
            <Download />
            {seeding ? "Seeding…" : "Seed from ads.txt"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Active zones" value={`${totalActive} / ${ZONES.length}`} accent="primary" />
        <StatCard label="Total code size" value={`${(totalCode / 1024).toFixed(1)} KB`} accent="accent" />
        <StatCard label="File" value="config/ads.txt" accent="warning" mono />
      </div>

      {loading ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Loading placements…</Card>
      ) : (
        <div className="space-y-3">
          {ZONES.map((z, i) => (
            <motion.div
              key={z.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <ZoneEditor
                zone={z}
                placement={placements[z.id]}
                onSave={(patch) => save(z.id, patch)}
              />
            </motion.div>
          ))}
        </div>
      )}

      <FileHint />
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: string;
  accent: "primary" | "accent" | "warning";
  mono?: boolean;
}) {
  const colorMap = {
    primary: "from-primary/20 to-primary/5 text-primary",
    accent: "from-accent/20 to-accent/5 text-accent",
    warning: "from-warning/20 to-warning/5 text-warning",
  } as const;
  return (
    <Card className={cn("relative overflow-hidden p-4")}>
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", colorMap[accent])} />
      <div className="relative">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={cn("mt-1 text-xl font-semibold tracking-tight", mono && "font-mono text-base")}>
          {value}
        </p>
      </div>
    </Card>
  );
}

function ZoneEditor({
  zone,
  placement,
  onSave,
}: {
  zone: (typeof ZONES)[number];
  placement: Placement | undefined;
  onSave: (patch: Partial<Placement>) => void | Promise<void>;
}) {
  const [code, setCode] = React.useState(placement?.code ?? "");
  const [active, setActive] = React.useState(placement?.active ?? false);
  const [notes, setNotes] = React.useState(placement?.notes ?? "");
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [previewKey, setPreviewKey] = React.useState(0);
  const previewRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setCode(placement?.code ?? "");
      setActive(placement?.active ?? false);
      setNotes(placement?.notes ?? "");
      setDirty(false);
    }, 0);
    return () => window.clearTimeout(id);
  }, [placement?.zoneId, placement?.code, placement?.active, placement?.notes, placement?.updatedAt]);

  React.useEffect(() => {
    if (!placement) return;
    const dirtyNow =
      code !== placement.code || active !== placement.active || notes !== placement.notes;
    const id = window.setTimeout(() => setDirty(dirtyNow), 0);
    return () => window.clearTimeout(id);
  }, [code, active, notes, placement]);

  React.useEffect(() => {
    if (!previewRef.current) return;
    previewRef.current.innerHTML = code;
    const scripts = Array.from(previewRef.current.querySelectorAll("script"));
    scripts.forEach((old) => {
      const fresh = document.createElement("script");
      for (const attr of Array.from(old.attributes)) {
        fresh.setAttribute(attr.name, attr.value);
      }
      if (!old.src && old.textContent) fresh.text = old.textContent;
      old.parentNode?.replaceChild(fresh, old);
    });
  }, [code, previewKey]);

  async function save() {
    setSaving(true);
    try {
      await onSave({ code, active, notes });
    } finally {
      setSaving(false);
    }
  }

  const status: "empty" | "live" | "paused" | "unconfigured" =
    !placement
      ? "unconfigured"
      : !placement.code.trim()
        ? "empty"
        : placement.active
          ? "live"
          : "paused";

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3 border-b border-border/40 p-4 lg:border-b-0 lg:border-r">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Megaphone className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{zone.label}</h3>
                  <code className="rounded bg-card/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {zone.id}
                  </code>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "border-0",
                      status === "live" && "bg-success/15 text-success",
                      status === "paused" && "bg-warning/15 text-warning",
                      status === "empty" && "bg-muted text-muted-foreground",
                      status === "unconfigured" && "bg-muted text-muted-foreground",
                    )}
                  >
                    {status === "live"
                      ? "Live"
                      : status === "paused"
                        ? "Paused"
                        : status === "empty"
                          ? "Empty"
                          : "Unconfigured"}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {zone.size} · {zone.position}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <Power className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Active</span>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5" />
                Ad code
              </Label>
              <span className="text-[10px] text-muted-foreground">
                {code.length.toLocaleString()} chars
              </span>
            </div>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`<!-- Paste your ${zone.label} (${zone.size}) ad code here. -->\n<!-- e.g. <script src="https://..."></script> or <iframe> -->`}
              rows={6}
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Adsterra banner #A-12345"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button onClick={save} disabled={saving || !dirty} variant="gradient" size="sm">
              <Save />
              {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={() => setPreviewKey((k) => k + 1)}
              type="button"
            >
              <RefreshCcw /> Re-render preview
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (!code) return;
                await navigator.clipboard.writeText(code);
                toast.success("Code copied to clipboard");
              }}
              disabled={!code}
              type="button"
            >
              <Copy /> Copy
            </Button>
            <div className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {dirty ? (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-warning" />
                  Unsaved changes
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 text-success" />
                  Up to date
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 p-4">
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              Live preview · {zone.size}
            </p>
          </div>
          <div
            className="mx-auto grid place-items-center overflow-hidden rounded-xl border-2 border-dashed border-border/60 bg-secondary/30"
            style={{ width: "100%", maxWidth: zone.size.split("×")[0], height: zone.size.split("×")[1] }}
          >
            <div
              ref={previewRef}
              className="h-full w-full"
            />
            {!code.trim() ? (
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground">
                <EyeOff className="mr-1.5 h-3.5 w-3.5" /> No code yet
              </div>
            ) : null}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Preview is sandboxed to this panel only. The same code renders on the live redirect page
            when <strong>Active</strong> is on.
          </p>
        </div>
      </div>
    </Card>
  );
}

function FileHint() {
  const [show, setShow] = React.useState(false);
  const [content, setContent] = React.useState("");
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium">Or edit the file directly</p>
          <code className="rounded bg-card/60 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            config/ads.txt
          </code>
        </div>
        <Button variant="glass" size="sm" onClick={() => setShow((v) => !v)}>
          {show ? "Hide" : "Show"} template
        </Button>
      </div>
      {show ? (
        <pre className="mt-3 max-h-72 overflow-auto rounded-xl border border-border/40 bg-background/60 p-3 font-mono text-[11px] leading-relaxed text-foreground/90">
{content || EXAMPLE}
        </pre>
      ) : null}
      <p className="mt-2 text-[11px] text-muted-foreground">
        On dev, edits in this file are picked up on next request (after <em>Seed from ads.txt</em> or a server restart). On Vercel,
        the database is the source of truth — use the form above.
      </p>
    </Card>
  );
}

const EXAMPLE = `# config/ads.txt
# Each section starts with [zone-id] then the ad code.
# Save the file, then click "Seed from ads.txt" to import.

[zone1]
<!-- 728x90 Leaderboard -->
<script async src="https://www.example.com/zone1.js"></script>

[zone2]
<!-- 336x280 Large Rectangle -->
<iframe src="https://www.example.com/zone2"
        width="336" height="280" frameborder="0"></iframe>

[zone3]
<!-- 300x250 Medium Rectangle -->

[zone4]
<!-- 300x600 Half Page -->

[zone5]
<!-- 320x50 Mobile Banner -->
`;
