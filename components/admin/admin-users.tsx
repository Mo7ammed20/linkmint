"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Search, MoreHorizontal, ShieldOff, ShieldCheck, Mail, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usePlatformStore, type SeedUser } from "@/stores/platform-store";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

export function AdminUsers() {
  const users = usePlatformStore((s) => s.users);
  const setUserStatus = usePlatformStore((s) => s.setUserStatus);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<SeedUser["status"] | "all">("all");
  const filtered = users.filter((u) => {
    if (status !== "all" && u.status !== status) return false;
    if (query && !`${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
        <p className="text-sm text-muted-foreground">Manage every account on the platform.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:max-w-sm">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {(["all", "active", "pending", "suspended"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-full border border-border/60 px-3 py-1 text-xs capitalize transition-colors ${
                status === s ? "bg-foreground/10" : "hover:bg-secondary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Clicks</th>
                <th className="px-5 py-3 font-medium">Earnings</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/40 last:border-0"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent" />
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="secondary" className="capitalize">
                      {u.plan}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
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
                  </td>
                  <td className="px-5 py-3 font-mono text-sm">{u.totalClicks.toLocaleString("en-US")}</td>
                  <td className="px-5 py-3 font-mono text-sm">{formatCurrency(u.totalEarnings)}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {formatRelativeTime(u.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>{u.email}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => toast.success(`Message sent to ${u.name}`)}>
                          <Mail /> Send message
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => toast.success("User promoted")}>
                          <ShieldCheck /> Promote to admin
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {u.status === "suspended" ? (
                          <DropdownMenuItem
                            onSelect={() => {
                              setUserStatus(u.id, "active");
                              toast.success("User unsuspended");
                            }}
                          >
                            <ShieldCheck /> Unsuspend
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            destructive
                            onSelect={() => {
                              setUserStatus(u.id, "suspended");
                              toast.success("User suspended");
                            }}
                          >
                            <ShieldOff /> Suspend
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
