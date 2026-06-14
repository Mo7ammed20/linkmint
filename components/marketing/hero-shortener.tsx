"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Link2, Copy, Check, ArrowRight, Sparkles, Lock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLinksStore } from "@/stores/links-store";
import { useAuthStore } from "@/stores/auth-store";

export function HeroShortener() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [url, setUrl] = React.useState("https://your-domain.com/launch/spring-2026");
  const [alias, setAlias] = React.useState("");
  const [created, setCreated] = React.useState<{ shortCode: string; destination: string } | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [redirectMs, setRedirectMs] = React.useState<string | null>(null);
  const createLink = useLinksStore((s) => s.createLink);

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setRedirectMs((Math.random() * 1.4 + 0.4).toFixed(1));
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const displayRedirectMs = redirectMs ?? "0.8";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }
    if (!isAuthenticated) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("linkmint.pendingUrl", url.trim());
        if (alias.trim()) sessionStorage.setItem("linkmint.pendingAlias", alias.trim());
      }
      router.push("/register");
      return;
    }
    try {
      const link = await createLink({ destination: url.trim(), customAlias: alias.trim() || undefined });
      setCreated({ shortCode: link.shortCode, destination: link.destination });
      toast.success("Short link created", { description: `linkmint.io/r/${link.shortCode}` });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error("Couldn't shorten that link", { description: message });
    }
  }

  async function copy() {
    if (!created) return;
    const full = `${typeof window !== "undefined" ? window.location.origin : "https://linkmint.io"}/r/${created.shortCode}`;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1600);
  }

  function reset() {
    setCreated(null);
    setAlias("");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="group relative mx-auto w-full max-w-2xl"
    >
      <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-primary/40 via-accent/40 to-primary/30 opacity-50 blur-2xl transition-opacity duration-500 group-hover:opacity-80" />
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-2 shadow-2xl backdrop-blur-xl">
        <div className="grid-pattern absolute inset-0 -z-10 opacity-30" />
        <div className="rounded-2xl bg-card/60 p-4 sm:p-5">
          {created ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Your short link is live</p>
                  <p className="text-xs text-muted-foreground">Earnings start accruing immediately.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 p-1.5">
                <div className="flex flex-1 items-center gap-2 px-2.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="truncate font-mono text-sm">
                    {typeof window !== "undefined" ? window.location.origin : "linkmint.io"}/r/<span className="text-primary">{created.shortCode}</span>
                  </span>
                </div>
                <Button size="sm" onClick={copy} className="h-8">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> {displayRedirectMs}s avg redirect
                  </span>
                  <span>→ {truncate(created.destination, 38)}</span>
                </div>
                <button onClick={reset} className="text-primary hover:underline">
                  Shorten another
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Link2 className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Try the shortener</span>
                <span className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                  live demo
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste a long URL…"
                  leftIcon={<Link2 className="opacity-60" />}
                  className="h-12 flex-1"
                />
                <Input
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="custom alias (optional)"
                  leftIcon={<span className="text-xs text-muted-foreground">/r/</span>}
                  className="h-12 sm:w-48"
                />
              </div>
              {error ? (
                <p className={cn("text-xs text-destructive")}>{error}</p>
              ) : null}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {isAuthenticated
                    ? "Your links persist and earn revenue immediately."
                    : "Sign up free to shorten links and start earning."}
                </p>
                <Button type="submit" size="sm" variant="gradient" className="h-9">
                  {isAuthenticated ? "Shorten" : "Sign up & shorten"}
                  <ArrowRight />
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
