"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Slider } from "@/components/ui/slider";
import { SectionHeader } from "@/components/marketing/section-header";
import { AnimatedCounter } from "@/components/motion/animated";
import { formatCurrency } from "@/lib/utils";

const CPM_TIERS = [
  { region: "Tier 1", cpm: 8.4, label: "US, UK, CA, AU" },
  { region: "Tier 2", cpm: 4.2, label: "EU, JP, BR" },
  { region: "Tier 3", cpm: 1.6, label: "Global" },
];

function generateSeries(monthlyClicks: number, cpm: number) {
  const out: Array<{ month: string; revenue: number }> = [];
  const monthly = (monthlyClicks / 1000) * cpm;
  for (let i = 0; i < 12; i++) {
    const trend = 0.85 + (i / 11) * 0.35;
    const seasonal = 1 + Math.sin((i / 12) * Math.PI * 2) * 0.12;
    out.push({ month: month(i), revenue: Number((monthly * trend * seasonal).toFixed(2)) });
  }
  return out;
}

function month(i: number) {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]!;
}

export function RevenueCalculator() {
  const [clicks, setClicks] = React.useState(120_000);
  const [cpm, setCpm] = React.useState(4.2);
  const data = React.useMemo(() => generateSeries(clicks, cpm), [clicks, cpm]);
  const total = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Earnings"
          title={<>Estimate your <span className="text-gradient-static">monthly revenue</span></>}
          description="Move the sliders. The chart updates live."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            className="glass-strong relative overflow-hidden rounded-3xl p-6 lg:col-span-2"
          >
            <div className="absolute inset-0 grid-pattern opacity-30" />
            <div className="relative">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight">
                  <AnimatedCounter value={total} format={(n) => formatCurrency(n)} />
                </span>
                <span className="text-sm text-muted-foreground">/year</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Based on {clicks.toLocaleString("en-US")} clicks/mo at ${cpm.toFixed(2)} CPM.
              </p>

              <div className="mt-8 space-y-6">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <label className="font-medium">Monthly clicks</label>
                    <span className="font-mono text-muted-foreground">{clicks.toLocaleString("en-US")}</span>
                  </div>
                  <div className="mt-3">
                    <Slider
                      min={10_000}
                      max={2_000_000}
                      step={5_000}
                      value={[clicks]}
                      onValueChange={(v) => setClicks(v[0]!)}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <label className="font-medium">Effective CPM</label>
                    <span className="font-mono text-muted-foreground">${cpm.toFixed(2)}</span>
                  </div>
                  <div className="mt-3">
                    <Slider
                      min={0.5}
                      max={12}
                      step={0.1}
                      value={[cpm]}
                      onValueChange={(v) => setCpm(v[0]!)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {CPM_TIERS.map((t) => (
                    <button
                      key={t.region}
                      type="button"
                      onClick={() => setCpm(t.cpm)}
                      className="rounded-lg border border-border/60 bg-background/40 p-2 text-left text-xs transition-colors hover:border-border"
                    >
                      <div className="font-semibold">{t.region}</div>
                      <div className="text-muted-foreground">${t.cpm.toFixed(2)}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0.1 }}
            className="glass relative overflow-hidden rounded-3xl p-6 lg:col-span-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">12-month projection</h3>
                <p className="text-sm text-muted-foreground">Projected earnings, before fees.</p>
              </div>
              <div className="flex gap-1.5 rounded-full border border-border/60 bg-card/40 p-1 text-xs">
                <span className="rounded-full bg-foreground/10 px-2.5 py-1 font-medium">Monthly</span>
                <span className="rounded-full px-2.5 py-1 text-muted-foreground">Cumulative</span>
              </div>
            </div>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.7 0.22 280)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="oklch(0.7 0.22 280)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="color-mix(in oklch, var(--foreground) 6%, transparent)" strokeDasharray="3 4" vertical={false} />
                  <XAxis dataKey="month" stroke="oklch(0.6 0.01 280)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="oklch(0.6 0.01 280)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    cursor={{ stroke: "oklch(0.7 0.22 280)", strokeWidth: 1, strokeDasharray: "4 4" }}
                    contentStyle={{
                      background: "oklch(0.17 0.018 280 / 0.9)",
                      border: "1px solid oklch(1 0 0 / 0.08)",
                      borderRadius: "10px",
                      backdropFilter: "blur(10px)",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "oklch(0.7 0.01 280)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="oklch(0.7 0.22 280)"
                    strokeWidth={2}
                    fill="url(#rev-grad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
