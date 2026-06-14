"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  MousePointerClick,
  DollarSign,
  Link2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Sparkles,
  Copy,
  ExternalLink,
  Globe2,
} from "lucide-react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/motion/animated";
import { GlowCard } from "@/components/motion/magnetic";
import { useLinksStore } from "@/stores/links-store";
import { useAuthStore } from "@/stores/auth-store";
import { usePlatformStore } from "@/stores/platform-store";
import { useAnalyticsStore } from "@/stores/analytics-store";
import { formatCompact, formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function OverviewDashboard() {
  const user = useAuthStore((s) => s.user);
  const links = useLinksStore((s) => s.links);
  const auditLog = usePlatformStore((s) => s.auditLog);
  const series = useAnalyticsStore((s) => s.series);
  const countries = useAnalyticsStore((s) => s.countries).slice(0, 4);
  const referrers = useAnalyticsStore((s) => s.referrers).slice(0, 4);
  const totalClicks = series.reduce((s, d) => s + d.clicks, 0);
  const totalRevenue = series.reduce((s, d) => s + d.revenue, 0);
  const topLinks = [...links].sort((a, b) => b.clicks - a.clicks).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Hello, {user?.name?.split(" ")[0] ?? "there"} <span className="inline-block animate-[float_3s_ease-in-out_infinite]">👋</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your links earned <span className="font-medium text-foreground">{formatCurrency(totalRevenue)}</span> in the last 30 days.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="glass" size="sm">
            <Link href="/dashboard/analytics">
              <BarIcon /> View analytics
            </Link>
          </Button>
          <Button asChild size="sm" variant="gradient">
            <Link href="/dashboard/links">
              <Plus /> New link
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={MousePointerClick}
          label="Total clicks"
          value={totalClicks}
          delta={12.4}
          format={formatCompact}
        />
        <KpiCard
          icon={DollarSign}
          label="Revenue (30d)"
          value={totalRevenue}
          delta={18.2}
          format={(n) => formatCurrency(n)}
        />
        <KpiCard
          icon={Link2}
          label="Active links"
          value={links.length}
          delta={3}
          format={(n) => Math.round(n).toString()}
        />
        <KpiCard
          icon={TrendingUp}
          label="Avg CPM"
          value={2.84}
          delta={4.1}
          format={(n) => `$${n.toFixed(2)}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-sm lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Clicks & revenue</h3>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
            <Badge variant="glass" className="gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              Trending up
            </Badge>
          </div>
          <div className="mt-3 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ov-clicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.22 280)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.7 0.22 280)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ov-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.22 320)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.78 0.22 320)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="color-mix(in oklch, var(--foreground) 6%, transparent)" strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="date" stroke="oklch(0.6 0.01 280)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis yAxisId="left" stroke="oklch(0.6 0.01 280)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => formatCompact(v)} />
                <YAxis yAxisId="right" orientation="right" stroke="oklch(0.6 0.01 280)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.17 0.018 280 / 0.9)",
                    border: "1px solid oklch(1 0 0 / 0.08)",
                    borderRadius: "10px",
                    backdropFilter: "blur(10px)",
                    fontSize: "12px",
                  }}
                />
                <Area yAxisId="left" type="monotone" dataKey="clicks" stroke="oklch(0.7 0.22 280)" strokeWidth={2} fill="url(#ov-clicks)" />
                <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="oklch(0.78 0.22 320)" strokeWidth={2} fill="url(#ov-rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Top countries</h3>
            <Globe2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <ul className="mt-4 space-y-3.5">
            {countries.map((c, i) => (
              <li key={c.code} className="flex items-center gap-3">
                <span className="text-lg">{c.flag}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">{c.name}</span>
                    <span className="font-mono text-muted-foreground">{formatCompact(c.clicks)}</span>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-secondary">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.clicks / countries[0]!.clicks) * 100}%` }}
                      transition={{ duration: 0.7, delay: 0.2 + i * 0.05 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm lg:col-span-2"
        >
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <h3 className="text-sm font-semibold">Top performing links</h3>
              <p className="text-xs text-muted-foreground">Sorted by clicks</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
              <Link href="/dashboard/links">View all</Link>
            </Button>
          </div>
          <ul className="divide-y divide-border/40">
            {topLinks.map((l, i) => (
              <motion.li
                key={l.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.3 }}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-secondary/30"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Link2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.title ?? l.destination}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">/r/{l.shortCode}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium">{formatCompact(l.clicks)}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(l.earnings)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/r/${l.shortCode}`);
                    toast.success("Link copied");
                  }}
                  aria-label="Copy link"
                >
                  <Copy />
                </Button>
                <Button asChild variant="ghost" size="icon-sm" aria-label="Open link">
                  <a href={`/r/${l.shortCode}`} target="_blank" rel="noreferrer">
                    <ExternalLink />
                  </a>
                </Button>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-sm"
        >
          <h3 className="text-sm font-semibold">Recent activity</h3>
          <ul className="mt-4 space-y-3.5">
            {auditLog.slice(0, 6).map((entry) => (
              <li key={entry.id} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{entry.actorName}</span>{" "}
                    <span className="text-muted-foreground">· {entry.action}</span>
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    {formatRelativeTime(entry.createdAt)} · {entry.ip}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {referrers.map((r) => (
          <GlowCard key={r.name} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{r.name}</span>
              <Badge variant="glass" className="font-mono">{(r.share * 100).toFixed(0)}%</Badge>
            </div>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              <AnimatedCounter value={r.clicks} format={formatCompact} />
            </p>
            <p className="mt-1 text-xs text-muted-foreground">clicks this month</p>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  format,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  delta: number;
  format: (n: number) => string;
}) {
  const up = delta >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlowCard className="p-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
              up ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
            }`}
          >
            {up ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
            {Math.abs(delta)}%
          </span>
        </div>
        <p className="mt-3 text-2xl font-semibold tracking-tight">
          <AnimatedCounter value={value} format={format} />
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </GlowCard>
    </motion.div>
  );
}

function BarIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}
