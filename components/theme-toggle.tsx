"use client";

import * as React from "react";
import { useThemeStore, applyTheme } from "@/stores/theme-store";
import { Moon, Sun, Sparkles, MonitorSmartphone } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "midnight", label: "Midnight", icon: Sparkles },
  { value: "system", label: "System", icon: MonitorSmartphone },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const resolved = useThemeStore((s) => s.resolved);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (useThemeStore.getState().mode === "system") {
        const r = mq.matches ? "dark" : "light";
        useThemeStore.setState({ resolved: r });
        applyTheme(r);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border/60 bg-card/50 p-0.5 backdrop-blur-md",
        className,
      )}
      role="radiogroup"
      aria-label="Theme"
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = mode === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setMode(opt.value)}
            title={opt.label}
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-all duration-200",
              active && "bg-foreground/10 text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--foreground)_10%,transparent)]",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
