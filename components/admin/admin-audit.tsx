"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePlatformStore } from "@/stores/platform-store";
import { formatRelativeTime } from "@/lib/utils";

export function AdminAudit() {
  const audit = usePlatformStore((s) => s.auditLog);
  const [query, setQuery] = React.useState("");
  const filtered = audit.filter(
    (a) =>
      !query ||
      `${a.actorName} ${a.action} ${a.target}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Audit log</h2>
        <p className="text-sm text-muted-foreground">Every privileged action on the platform.</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full sm:max-w-sm">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actor, action, target…"
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      <Card>
        <ul className="divide-y divide-border/40">
          {filtered.map((a, i) => (
            <motion.li
              key={a.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-4 px-5 py-3.5"
            >
              <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent" />
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{a.actorName}</span>
                  <span className="text-muted-foreground"> · {a.action}</span>
                </p>
                <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                  target: {a.target} · ip: {a.ip}
                </p>
              </div>
              <Badge variant="glass" className="font-mono">
                {formatRelativeTime(a.createdAt)}
              </Badge>
            </motion.li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
