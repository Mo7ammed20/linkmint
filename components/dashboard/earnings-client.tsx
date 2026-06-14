"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Plus,
  RefreshCcw,
  Banknote,
  Bitcoin,
  CircleDollarSign,
  Copy,
  Check,
  Download,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuthStore } from "@/stores/auth-store";
import { usePlatformStore, type SeedPayout } from "@/stores/platform-store";
import { formatCurrency, formatDate, formatRelativeTime, cn } from "@/lib/utils";
import { toast } from "sonner";

const METHODS = [
  { id: "paypal", label: "PayPal", icon: CircleDollarSign },
  { id: "bank", label: "Bank transfer", icon: Banknote },
  { id: "crypto", label: "Crypto (USDC)", icon: Bitcoin },
  { id: "stripe", label: "Stripe Connect", icon: CreditCard },
] as const;

export function EarningsClient() {
  const user = useAuthStore((s) => s.user);
  const payouts = usePlatformStore((s) => s.payouts);
  const requestPayout = usePlatformStore((s) => s.requestPayout);
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState("250");
  const [method, setMethod] = React.useState<SeedPayout["method"]>("paypal");
  const [submitting, setSubmitting] = React.useState(false);

  const available = user?.totalEarnings ?? 0;
  const pending = payouts.filter((p) => p.status === "pending" || p.status === "processing").reduce((s, p) => s + p.amount, 0);
  const lifetime = payouts.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0);

  async function submit() {
    const n = Number(amount);
    if (!n || n < 10) {
      toast.error("Minimum payout is $10");
      return;
    }
    if (n > available) {
      toast.error("Amount exceeds available balance");
      return;
    }
    setSubmitting(true);
    try {
      await requestPayout(n, method);
      toast.success("Payout requested");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div
            className="relative p-6"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklch, var(--primary) 25%, transparent), color-mix(in oklch, var(--accent) 25%, transparent))",
            }}
          >
            <div className="grid-pattern absolute inset-0 opacity-30" />
            <div className="relative">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Available balance</p>
              <p className="mt-2 text-5xl font-semibold tracking-tight">
                <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  {formatCurrency(available)}
                </motion.span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pending: {formatCurrency(pending)} · Lifetime: {formatCurrency(lifetime + available + pending)}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button variant="gradient" size="lg">
                      <ArrowUpRight /> Request payout
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request a payout</DialogTitle>
                      <p className="text-sm text-muted-foreground">
                        Available balance: <span className="font-medium text-foreground">{formatCurrency(available)}</span>
                      </p>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          leftIcon={<span className="text-xs text-muted-foreground">$</span>}
                        />
                        <div className="flex gap-1.5">
                          {[50, 100, 500, available].map((a) => (
                            <button
                              key={a}
                              type="button"
                              onClick={() => setAmount(String(a))}
                              className="rounded-md border border-border/60 bg-card/40 px-2.5 py-1 text-xs hover:border-border"
                            >
                              {a === available ? "Max" : `$${a}`}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Method</Label>
                        <RadioGroup value={method} onValueChange={(v) => setMethod(v as SeedPayout["method"])}>
                          {METHODS.map((m) => {
                            const Icon = m.icon;
                            return (
                              <label
                                key={m.id}
                                htmlFor={m.id}
                                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-3 transition-colors hover:border-border has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                              >
                                <RadioGroupItem value={m.id} id={m.id} />
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{m.label}</span>
                              </label>
                            );
                          })}
                        </RadioGroup>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                          Cancel
                        </Button>
                        <Button variant="gradient" onClick={submit} loading={submitting}>
                          <ArrowUpRight />
                          Request {formatCurrency(Number(amount) || 0)}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="glass" size="lg">
                  <RefreshCcw /> Refresh
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold">Payment methods</h3>
          <p className="text-xs text-muted-foreground">Where your payouts go</p>
          <ul className="mt-4 space-y-2.5">
            {METHODS.map((m) => {
              const Icon = m.icon;
              return (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-secondary">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm font-medium">{m.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">Default</Badge>
                </li>
              );
            })}
          </ul>
          <Button variant="glass" size="sm" className="mt-3 w-full">
            <Plus /> Add method
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">This month</p>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-medium text-success">
              <ArrowUpRight className="h-2.5 w-2.5" /> 18.2%
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{formatCurrency(1482.18)}</p>
          <p className="mt-1 text-xs text-muted-foreground">vs last month</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Avg per click</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">$0.0142</p>
          <p className="mt-1 text-xs text-muted-foreground">across all links</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Top earner</p>
          <p className="mt-2 truncate text-sm font-semibold">Framer Motion docs</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(412.04)} / month</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between p-5 pb-3">
          <div>
            <h3 className="text-sm font-semibold">Payout history</h3>
            <p className="text-xs text-muted-foreground">All past withdrawals</p>
          </div>
          <Button variant="ghost" size="sm">
            <Download /> Download
          </Button>
        </div>
        <Separator />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Requested</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-border/40 last:border-0"
                >
                  <td className="px-5 py-3 font-mono text-xs">{p.reference ?? p.id}</td>
                  <td className="px-5 py-3 capitalize">{p.method}</td>
                  <td className="px-5 py-3 font-mono">{formatCurrency(p.amount)}</td>
                  <td className="px-5 py-3">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "border-0",
                        p.status === "completed" && "bg-success/15 text-success",
                        p.status === "pending" && "bg-warning/15 text-warning",
                        p.status === "processing" && "bg-primary/15 text-primary",
                        p.status === "failed" && "bg-destructive/15 text-destructive",
                      )}
                    >
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(p.requestedAt)}</td>
                  <td className="px-5 py-3 text-right">
                    {p.reference ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          navigator.clipboard.writeText(p.reference!);
                          toast.success("Reference copied");
                        }}
                      >
                        <Copy />
                      </Button>
                    ) : null}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
