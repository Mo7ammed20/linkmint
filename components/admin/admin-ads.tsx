"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Plus,
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
  Edit2,
  Eye,
  BarChart3,
  Megaphone,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usePlatformStore, type SeedAd } from "@/stores/platform-store";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/utils";
import { toast } from "sonner";

const TYPES: Array<{ value: SeedAd["type"]; label: string }> = [
  { value: "banner", label: "Banner" },
  { value: "native", label: "Native" },
  { value: "interstitial", label: "Interstitial" },
  { value: "popunder", label: "Popunder" },
  { value: "push", label: "Push" },
  { value: "mobile", label: "Mobile" },
];

export function AdminAds() {
  const ads = usePlatformStore((s) => s.ads);
  const setAd = usePlatformStore((s) => s.setAd);
  const createAd = usePlatformStore((s) => s.createAd);
  const deleteAd = usePlatformStore((s) => s.deleteAd);
  const [open, setOpen] = React.useState(false);
  const [previewing, setPreviewing] = React.useState<SeedAd | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Ads manager</h2>
          <p className="text-sm text-muted-foreground">Configure and preview every ad unit.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" size="sm">
              <Plus /> New ad
            </Button>
          </DialogTrigger>
          <NewAdDialog
            onClose={() => setOpen(false)}
            onCreate={(input) => {
              createAd(input);
              setOpen(false);
              toast.success("Ad created");
            }}
          />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {ads.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{a.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground capitalize">{a.type}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    a.status === "active"
                      ? "bg-success/15 text-success border-0"
                      : a.status === "paused"
                        ? "bg-warning/15 text-warning border-0"
                        : "bg-destructive/15 text-destructive border-0"
                  }
                >
                  {a.status}
                </Badge>
              </div>
              <div
                className="mt-3 rounded-xl border border-dashed border-border/60 bg-card/40 p-4 text-center text-xs text-muted-foreground"
                style={{ minHeight: 100 }}
              >
                <Megaphone className="mx-auto h-6 w-6 opacity-40" />
                <p className="mt-2 font-medium text-foreground/80">{a.name}</p>
                <p className="mt-1 line-clamp-2 text-[11px]">{a.body}</p>
                <span className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground">
                  {a.cta}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="font-mono text-sm font-semibold">{formatCompact(a.impressions)}</p>
                  <p className="text-muted-foreground">impr.</p>
                </div>
                <div>
                  <p className="font-mono text-sm font-semibold">{formatCompact(a.clicks)}</p>
                  <p className="text-muted-foreground">clicks</p>
                </div>
                <div>
                  <p className="font-mono text-sm font-semibold">{formatCurrency(a.cpm)}</p>
                  <p className="text-muted-foreground">CPM</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  CTR {formatPercent(a.ctr)} · {formatCurrency(a.revenue)} earned
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => setPreviewing(a)} aria-label="Preview">
                    <Eye />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="More">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onSelect={() => {
                          setAd(a.id, { status: a.status === "active" ? "paused" : "active" });
                          toast.success("Status updated");
                        }}
                      >
                        {a.status === "active" ? <Pause /> : <Play />}
                        {a.status === "active" ? "Pause" : "Resume"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit2 /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BarChart3 /> Performance
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        destructive
                        onSelect={() => {
                          deleteAd(a.id);
                          toast.success("Ad deleted");
                        }}
                      >
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={Boolean(previewing)} onOpenChange={(v) => !v && setPreviewing(null)}>
        {previewing ? <AdPreview ad={previewing} /> : null}
      </Dialog>
    </div>
  );
}

function NewAdDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (ad: Omit<SeedAd, "id" | "createdAt" | "impressions" | "clicks" | "revenue">) => void;
}) {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<SeedAd["type"]>("banner");
  const [body, setBody] = React.useState("");
  const [cta, setCta] = React.useState("Learn more");
  const [cpm, setCpm] = React.useState("2.5");
  const [url, setUrl] = React.useState("https://");
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New ad unit</DialogTitle>
        <p className="text-sm text-muted-foreground">Configure a new ad placement.</p>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onCreate({
            name,
            type,
            status: "active",
            cpm: Number(cpm),
            ctr: 0,
            body,
            cta,
            url,
          });
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Hero banner — launch" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as SeedAd["type"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>CPM (USD)</Label>
            <Input type="number" step="0.1" value={cpm} onChange={(e) => setCpm(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Body copy</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>CTA</Label>
            <Input value={cta} onChange={(e) => setCta(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient">
            <Plus /> Create ad
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

function AdPreview({ ad }: { ad: SeedAd }) {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Live preview · {ad.name}</DialogTitle>
        <p className="text-sm text-muted-foreground">Type: {ad.type} · {ad.width ?? "—"}×{ad.height ?? "—"}</p>
      </DialogHeader>
      <div className="grid place-items-center rounded-2xl border border-dashed border-border/60 bg-secondary/30 p-10">
        <div className="w-full max-w-md rounded-2xl bg-card p-6 text-center shadow-xl">
          <p className="text-lg font-semibold leading-snug">{ad.name}</p>
          <p className="mt-2 text-sm text-muted-foreground">{ad.body}</p>
          <button className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            {ad.cta}
          </button>
          <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground/60">Sponsored · Linkmint Ad Network</p>
        </div>
      </div>
    </DialogContent>
  );
}
