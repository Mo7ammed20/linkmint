"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Link2,
  Megaphone,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePlatformStore } from "@/stores/platform-store";
import { seedTimeSeries } from "@/lib/seed";
import { formatCompact, formatCurrency, formatRelativeTime } from "@/lib/utils";
import { AnimatedCounter } from "@/components/motion/animated";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const SERIES = seedTimeSeries(30);

export function AdminOverview() {
  const users = usePlatformStore((s) => s.users);
  const ads = usePlatformStore((s) => s.ads);
  const blog = usePlatformStore((s) => s.blogPosts);
  const audit = usePlatformStore((s) => s.auditLog);
  const totalClicks = SERIES.reduce((s, d) => s + d.clicks, 0);
  const totalRevenue = SERIES.reduce((s, d) => s + d.revenue, 0);
  const totalEarningsPaid = 38_400_000;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Admin overview</h2>
        <p className="text-sm text-muted-foreground">Platform-wide metrics and recent activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total users" value={users.length} delta={6.4} icon={Users} />
        <Kpi label="Active links" value={1124} delta={3.2} icon={Link2} />
        <Kpi label="Clicks (30d)" value={totalClicks} delta={12.4} icon={Activity} format={formatCompact} />
        <Kpi label="Revenue (30d)" value={totalRevenue} delta={18.2} icon={DollarSign} format={(n) => formatCurrency(n)} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold">Platform clicks</h3>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
          <div className="mt-3 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SERIES} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="admin-clicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.22 280)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.7 0.22 280)" stopOpacity={0} />
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
                <Area type="monotone" dataKey="clicks" stroke="oklch(0.7 0.22 280)" strokeWidth={2} fill="url(#admin-clicks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold">Lifetime payouts</h3>
          <p className="text-2xl font-semibold tracking-tight">
            <AnimatedCounter value={totalEarningsPaid} format={(n) => formatCurrency(n)} />
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Across all creators</p>
          <Separator className="my-4" />
          <ul className="space-y-2 text-sm">
            {ads.slice(0, 3).map((a) => (
              <li key={a.id} className="flex items-center justify-between">
                <span className="truncate">{a.name}</span>
                <span className="font-mono text-muted-foreground">{formatCurrency(a.revenue)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent users</h3>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
              <Link href="/admin/users">View all</Link>
            </Button>
          </div>
          <ul className="mt-3 divide-y divide-border/40">
            {users.map((u) => (
              <li key={u.id} className="flex items-center gap-3 py-2.5">
                <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {u.plan}
                </Badge>
                <Badge
                  variant="secondary"
                  className={
                    u.status === "active"
                      ? "bg-success/15 text-success border-0"
                      : u.status === "pending"
                        ? "bg-warning/15 text-warning border-0"
                        : "bg-destructive/15 text-destructive border-0"
                  }
                >
                  {u.status}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Audit log</h3>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
              <Link href="/admin/audit">View all</Link>
            </Button>
          </div>
          <ul className="mt-3 space-y-3">
            {audit.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{a.actorName}</span> · {a.action}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    {formatRelativeTime(a.createdAt)} · {a.target}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  icon: Icon,
  format,
}: {
  label: string;
  value: number;
  delta: number;
  icon: React.ComponentType<{ className?: string }>;
  format?: (n: number) => string;
}) {
  const up = delta >= 0;
  return (
    <Card className="p-4">
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
    </Card>
  );
}
