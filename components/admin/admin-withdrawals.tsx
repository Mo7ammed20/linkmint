"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, X, Eye, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { usePlatformStore, type SeedPayout } from "@/stores/platform-store";

export function AdminWithdrawals() {
  const payouts = usePlatformStore((s) => s.payouts);
  const advancePayout = usePlatformStore((s) => s.advancePayout);
  const pushAudit = usePlatformStore((s) => s.pushAudit);

  function approve(p: SeedPayout) {
    void advancePayout(p.id);
    pushAudit({ actorId: "u_admin", actorName: "Sienna Park", action: "payout.approve", target: p.id, ip: "104.18.42.6" });
    toast.success("Payout advanced");
  }
  function reject(p: SeedPayout) {
    pushAudit({ actorId: "u_admin", actorName: "Sienna Park", action: "payout.reject", target: p.id, ip: "104.18.42.6" });
    toast.success("Payout rejected");
  }

  const groups = {
    pending: payouts.filter((p) => p.status === "pending"),
    processing: payouts.filter((p) => p.status === "processing"),
    completed: payouts.filter((p) => p.status === "completed"),
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Withdrawals</h2>
        <p className="text-sm text-muted-foreground">Approve, reject, and audit creator payouts.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Pending" value={groups.pending.length} color="warning" />
        <Stat label="Processing" value={groups.processing.length} color="primary" />
        <Stat label="Completed (all-time)" value={groups.completed.length} color="success" />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Requested</th>
                <th className="px-5 py-3 font-medium">Actions</th>
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
                  <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(p.requestedAt)}</td>
                  <td className="px-5 py-3">
                    {(p.status === "pending" || p.status === "processing") && (
                      <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="gradient" onClick={() => approve(p)}>
                          <Check /> Approve
                        </Button>
                        <Button size="sm" variant="glass" onClick={() => reject(p)}>
                          <X /> Reject
                        </Button>
                      </div>
                    )}
                    {p.status === "completed" ? (
                      <Button size="sm" variant="ghost">
                        <Eye /> View
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

function Stat({ label, value, color }: { label: string; value: number; color: "warning" | "primary" | "success" }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <Badge
        variant="secondary"
        className={cn(
          "mt-2 border-0",
          color === "warning" && "bg-warning/15 text-warning",
          color === "primary" && "bg-primary/15 text-primary",
          color === "success" && "bg-success/15 text-success",
        )}
      >
        <Wallet className="h-3 w-3" />
        Payouts
      </Badge>
    </Card>
  );
}
