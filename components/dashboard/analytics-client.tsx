"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Download, Calendar, Globe2, Monitor, Smartphone, Tablet } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsStore } from "@/stores/analytics-store";
import { formatCompact, formatCurrency } from "@/lib/utils";
import { AnimatedCounter } from "@/components/motion/animated";

const COLORS = ["oklch(0.7 0.22 280)", "oklch(0.7 0.2 230)", "oklch(0.78 0.22 320)", "oklch(0.7 0.18 155)", "oklch(0.78 0.18 50)", "oklch(0.7 0.18 25)"];

export function AnalyticsClient() {
  const [range, setRange] = React.useState<"7" | "30" | "90">("30");
  const series = useAnalyticsStore((s) => s.series);
  const countries = useAnalyticsStore((s) => s.countries);
  const devices = useAnalyticsStore((s) => s.devices);
  const browsers = useAnalyticsStore((s) => s.browsers);
  const referrers = useAnalyticsStore((s) => s.referrers);
  const isLoading = useAnalyticsStore((s) => s.isLoading);
  const fetchAll = useAnalyticsStore((s) => s.fetchAll);

  React.useEffect(() => {
    void fetchAll(Number(range));
  }, [range, fetchAll]);

  const totalClicks = series.reduce((s, d) => s + d.clicks, 0);
  const totalRevenue = series.reduce((s, d) => s + d.revenue, 0);

  if (isLoading && series.length === 0) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[340px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
          <p className="text-sm text-muted-foreground">Real-time performance for every link.</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={range} onValueChange={(v) => setRange(v as typeof range)}>
            <TabsList>
              <TabsTrigger value="7">7d</TabsTrigger>
              <TabsTrigger value="30">30d</TabsTrigger>
              <TabsTrigger value="90">90d</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="glass" size="sm">
            <Download /> Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Clicks" value={totalClicks} format={formatCompact} />
        <Stat label="Revenue" value={totalRevenue} format={(n) => formatCurrency(n)} />
        <Stat label="Avg CPM" value={2.84} format={(n) => `$${n.toFixed(2)}`} />
        <Stat label="Conv. rate" value={0.034} format={(n) => `${(n * 100).toFixed(2)}%`} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold">Clicks & revenue</h3>
          <p className="text-xs text-muted-foreground">Combined time series</p>
          <div className="mt-3 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="an-clicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.22 280)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.7 0.22 280)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="an-rev" x1="0" y1="0" x2="0" y2="1">
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
                <Area yAxisId="left" type="monotone" dataKey="clicks" stroke="oklch(0.7 0.22 280)" strokeWidth={2} fill="url(#an-clicks)" />
                <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="oklch(0.78 0.22 320)" strokeWidth={2} fill="url(#an-rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold">Browsers</h3>
          <p className="text-xs text-muted-foreground">Share of clicks</p>
          <div className="mt-3 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={browsers} dataKey="share" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {browsers.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="oklch(0.13 0.015 280)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.17 0.018 280 / 0.9)",
                    border: "1px solid oklch(1 0 0 / 0.08)",
                    borderRadius: "10px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Devices</h3>
              <p className="text-xs text-muted-foreground">Clicks by device type</p>
            </div>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </div>
          <ul className="mt-4 space-y-3">
            {devices.map((d, i) => {
              const Icon = d.name === "Desktop" ? Monitor : d.name === "Tablet" ? Tablet : Smartphone;
              return (
                <li key={d.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {d.name}
                    </span>
                    <span className="font-mono text-muted-foreground">{(d.share * 100).toFixed(0)}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-secondary">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.share * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Top countries</h3>
              <p className="text-xs text-muted-foreground">Where your clicks come from</p>
            </div>
            <Globe2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <ul className="mt-3 space-y-3">
            {countries.slice(0, 6).map((c) => (
              <li key={c.code} className="flex items-center gap-3">
                <span className="text-lg">{c.flag}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">{c.name}</span>
                    <span className="font-mono text-muted-foreground">{formatCompact(c.clicks)}</span>
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${(c.clicks / countries[0]!.clicks) * 100}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold">Referrers</h3>
          <p className="text-xs text-muted-foreground">Clicks by source</p>
          <div className="mt-3 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={referrers} layout="vertical" margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="color-mix(in oklch, var(--foreground) 6%, transparent)" strokeDasharray="3 4" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="oklch(0.6 0.01 280)" fontSize={11} tickLine={false} axisLine={false} width={80} />
                <Tooltip
                  cursor={{ fill: "color-mix(in oklch, var(--primary) 10%, transparent)" }}
                  contentStyle={{
                    background: "oklch(0.17 0.018 280 / 0.9)",
                    border: "1px solid oklch(1 0 0 / 0.08)",
                    borderRadius: "10px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="clicks" fill="oklch(0.7 0.22 280)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, format }: { label: string; value: number; format: (n: number) => string }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">
        <AnimatedCounter value={value} format={format} />
      </p>
    </Card>
  );
}
