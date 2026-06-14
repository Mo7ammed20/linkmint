"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Bar, BarChart } from "recharts";
import { ArrowUpRight, Globe, Smartphone, Monitor, Tablet, ChevronUp } from "lucide-react";
import { SectionHeader } from "@/components/marketing/section-header";
import { seedTimeSeries, seedCountries, seedDevices } from "@/lib/seed";
import { AnimatedCounter } from "@/components/motion/animated";
import { formatCompact } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
  "Smart TV": ChevronUp,
};

const SERIES = seedTimeSeries(30).map((d, i, arr) => ({
  ...d,
  prev: arr[Math.max(0, i - 7)]?.clicks ?? d.clicks,
}));
const COUNTRIES = seedCountries().slice(0, 6);
const DEVICES = seedDevices();

export function AnalyticsShowcase() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Analytics"
          title={<>A dashboard that <span className="text-gradient-static">earns its place</span></>}
          description="Real-time insights, beautiful by default. Built for teams that care about both numbers and craft."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="glass-strong relative mt-14 overflow-hidden rounded-3xl p-4 sm:p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Clicks (30d)", value: SERIES.reduce((s, d) => s + d.clicks, 0), delta: 12.4 },
              { label: "Revenue (30d)", value: SERIES.reduce((s, d) => s + d.revenue, 0), delta: 18.2, isCurrency: true },
              { label: "Avg CPM", value: 2.84, delta: 4.1, isCurrency: true, fixed: 2 },
              { label: "Active links", value: 64, delta: 3, fixed: 0 },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="rounded-2xl border border-border/40 bg-card/40 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-medium text-success">
                    <ArrowUpRight className="h-2.5 w-2.5" />
                    {kpi.delta}%
                  </span>
                </div>
                <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {kpi.isCurrency ? "$" : ""}
                  <AnimatedCounter
                    value={kpi.value}
                    format={(n) => (kpi.fixed != null ? n.toFixed(kpi.fixed) : formatCompact(n))}
                  />
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/40 bg-card/40 p-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Clicks over time</h3>
                <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/40 p-0.5 text-[11px]">
                  {["7d", "30d", "90d"].map((t, idx) => (
                    <span
                      key={t}
                      className={
                        idx === 1
                          ? "rounded-full bg-foreground/10 px-2.5 py-0.5 font-medium"
                          : "px-2.5 py-0.5 text-muted-foreground"
                      }
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-3 h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SERIES} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="showcase-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.78 0.22 320)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="oklch(0.78 0.22 320)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="color-mix(in oklch, var(--foreground) 6%, transparent)" strokeDasharray="3 4" vertical={false} />
                    <XAxis dataKey="date" stroke="oklch(0.6 0.01 280)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                    <YAxis stroke="oklch(0.6 0.01 280)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => formatCompact(v)} />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.17 0.018 280 / 0.9)",
                        border: "1px solid oklch(1 0 0 / 0.08)",
                        borderRadius: "10px",
                        backdropFilter: "blur(10px)",
                        fontSize: "12px",
                      }}
                    />
                    <Area type="monotone" dataKey="clicks" stroke="oklch(0.78 0.22 320)" strokeWidth={2} fill="url(#showcase-grad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-2xl border border-border/40 bg-card/40 p-4">
              <h3 className="text-sm font-semibold">Devices</h3>
              <div className="mt-3 h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DEVICES} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="color-mix(in oklch, var(--foreground) 6%, transparent)" strokeDasharray="3 4" vertical={false} />
                    <XAxis dataKey="name" stroke="oklch(0.6 0.01 280)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: "color-mix(in oklch, var(--primary) 10%, transparent)" }}
                      contentStyle={{
                        background: "oklch(0.17 0.018 280 / 0.9)",
                        border: "1px solid oklch(1 0 0 / 0.08)",
                        borderRadius: "10px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="clicks" fill="oklch(0.7 0.22 280)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 space-y-1.5">
                {DEVICES.map((d) => {
                  const Icon = ICONS[d.name] ?? Globe;
                  return (
                    <li key={d.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                      <span className="flex-1">{d.name}</span>
                      <span className="font-mono" suppressHydrationWarning>{formatCompact(d.clicks)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border/40 bg-card/40 p-4">
            <h3 className="text-sm font-semibold">Top countries</h3>
            <ul className="mt-3 space-y-2.5">
              {COUNTRIES.map((c) => (
                <li key={c.code} className="flex items-center gap-3">
                  <span className="text-lg">{c.flag}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{c.name}</span>
                      <span className="font-mono text-muted-foreground" suppressHydrationWarning>{formatCompact(c.clicks)}</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${(c.clicks / COUNTRIES[0]!.clicks) * 100}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
