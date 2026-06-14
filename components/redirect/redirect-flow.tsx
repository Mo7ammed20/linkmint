"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  X,
  Check,
  CircleDot,
  Zap,
  Timer,
  MousePointerClick,
  Megaphone,
  Layers,
  Gift,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/aurora-background";
import { cn } from "@/lib/utils";
import { AdBlockerGate } from "@/components/redirect/adblocker-gate";
import { useAdLoader } from "@/components/redirect/use-ad-loader";
import { AdZoneById } from "@/components/redirect/ad-zones";

const STEP_DURATION = 30;
const TOTAL_STEPS = 3;
const TOTAL_DURATION = STEP_DURATION * TOTAL_STEPS;

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

let currentToken = "";

async function trackAndGo(shortCode: string): Promise<void> {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        shortCode,
        country: "??",
        device: detectDevice(),
        browser: detectBrowser(),
        referrer: document.referrer ? new URL(document.referrer).hostname || "Direct" : "Direct",
      }),
      keepalive: true,
    });
  } catch {
  }
  try {
    const res = await postJSON<{ destination: string }>("/api/redirect/complete", { sessionToken: currentToken });
    window.location.href = res.destination;
  } catch {
    window.location.href = "/";
  }
}

function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/Tablet|iPad/i.test(ua)) return "Tablet";
  if (/Mobile|Android|iPhone/i.test(ua)) return "Mobile";
  if (/SmartTV|TV/i.test(ua)) return "Smart TV";
  return "Desktop";
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome|Chromium|CriOS/.test(ua)) return "Chrome";
  if (/Firefox|FxiOS/.test(ua)) return "Firefox";
  if (/Safari/.test(ua)) return "Safari";
  return "Other";
}

type StepDef = {
  id: number;
  label: string;
  sublabel: string;
  Icon: React.ComponentType<{ className?: string }>;
  copy: { title: string; body: string; cta: string };
};

const STEPS: StepDef[] = [
  {
    id: 0,
    label: "Verifying link",
    sublabel: "Scanning destination and unlocking sponsor offers",
    Icon: ShieldCheck,
    copy: {
      title: "Verifying your destination",
      body: "We're confirming the link is safe and preparing sponsor content for you to view.",
      cta: "Hold on for 30 seconds",
    },
  },
  {
    id: 1,
    label: "Loading sponsor",
    sublabel: "Sponsor ad content is loading — please wait",
    Icon: Sparkles,
    copy: {
      title: "Loading sponsor offer",
      body: "Three short ad placements will appear below. They fund the creators you follow.",
      cta: "30 seconds remaining in this step",
    },
  },
  {
    id: 2,
    label: "Preparing destination",
    sublabel: "Final checks complete — redirecting shortly",
    Icon: Zap,
    copy: {
      title: "Almost at your destination",
      body: "One last ad will show, then you'll be redirected automatically.",
      cta: "Get ready to continue",
    },
  },
];

const ACCENT_CLASSES = {
  primary: "from-primary/30 via-primary/10 to-transparent text-primary",
  accent: "from-accent/30 via-accent/10 to-transparent text-accent",
  warning: "from-warning/30 via-warning/10 to-transparent text-warning",
} as const;

const ADS: Array<{
  size: string;
  badge: string;
  title: string;
  body: string;
  cta: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent: keyof typeof ACCENT_CLASSES;
}> = [
  {
    size: "300×250",
    badge: "Sponsored · Step 1",
    title: "Build faster with Linkmint Pro",
    body: "Unlock custom aliases, deep analytics, and 2× higher CPM payouts for every link you share.",
    cta: "Start free trial",
    Icon: Megaphone,
    accent: "primary",
  },
  {
    size: "728×90",
    badge: "Sponsored · Step 2",
    title: "Turn short links into a side income",
    body: "Join 12,400+ creators earning $0.002 per click with our monetization network.",
    cta: "See earnings",
    Icon: Layers,
    accent: "accent",
  },
  {
    size: "Native",
    badge: "Recommended · Step 3",
    title: "Get a $10 bonus on your first payout",
    body: "Withdraw to PayPal, crypto, or bank. New accounts receive a welcome bonus after the first $25.",
    cta: "Claim bonus",
    Icon: Gift,
    accent: "warning",
  },
];

export function RedirectFlow({
  sessionToken,
  shortCode,
  title,
  description: _description,
}: {
  sessionToken: string;
  shortCode: string;
  title: string | null;
  description: string | null;
}) {
  const [step, setStep] = React.useState(0);
  const [stepRemaining, setStepRemaining] = React.useState(STEP_DURATION);
  const [canContinue, setCanContinue] = React.useState(false);
  const [token, setToken] = React.useState(sessionToken);
  const [error, setError] = React.useState<string | null>(null);
  const stepStartRef = React.useRef<number>(0);
  const advancedRef = React.useRef<number>(-1);
  const { adsReady, isLoading: adsLoading, waitForAds } = useAdLoader();

  React.useEffect(() => {
    currentToken = token;
  }, [token]);

  React.useEffect(() => {
    stepStartRef.current = Date.now();
    advancedRef.current = -1;
    const id = window.setTimeout(() => {
      setStepRemaining(STEP_DURATION);
      setCanContinue(false);
    }, 0);
    void waitForAds(step + 1);
    return () => window.clearTimeout(id);
  }, [step, waitForAds]);

  React.useEffect(() => {
    if (!adsReady) return;
    if (stepStartRef.current === 0) return;
    const tick = () => {
      const elapsedMs = Date.now() - stepStartRef.current;
      const remaining = Math.max(0, STEP_DURATION - Math.floor(elapsedMs / 1000));
      setStepRemaining(remaining);
      if (remaining === 0 && advancedRef.current !== step) {
        advancedRef.current = step;
        setCanContinue(true);
      }
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [step, adsReady]);

  async function goNext() {
    if (!canContinue) return;
    if (step >= TOTAL_STEPS - 1) {
      void trackAndGo(shortCode);
      return;
    }
    try {
      const res = await postJSON<{ sessionToken: string; step: number }>("/api/redirect/step", {
        sessionToken: token,
        step: step + 1,
      });
      setToken(res.sessionToken);
      setStep((s) => s + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not advance");
    }
  }

  const totalRemaining = Math.max(
    TOTAL_DURATION - (step * STEP_DURATION + (STEP_DURATION - stepRemaining)),
    0,
  );

  return (
    <AdBlockerGate>
      <div className="relative min-h-dvh overflow-x-hidden">
        <AuroraBackground className="fixed inset-0 -z-10" intensity="high" />
        <div
          id="ad-detect-bait"
          className="ads ad-banner ad-placement adsbox"
          style={{ position: "absolute", left: -9999, top: -9999, width: 1, height: 1, pointerEvents: "none" }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex min-h-dvh flex-col">
          <header className="flex items-center justify-between p-4 sm:p-6">
            <Link href="/">
              <Logo />
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secured 3-step redirect
            </div>
          </header>

          <div className="px-4 sm:px-6">
            <div className="mx-auto max-w-6xl">
              <div className="mb-4 flex justify-center">
                <AdZoneById id="zone1" step={step} />
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-start justify-center px-4 py-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-6xl"
            >
              <StepHeader
                steps={STEPS}
                currentStep={step}
                stepProgress={1 - stepRemaining / STEP_DURATION}
                isFinished={false}
              />

              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr_300px]">
                <div className="space-y-4">
                  <CountdownPanel
                    stepRemaining={stepRemaining}
                    totalRemaining={totalRemaining}
                    currentStepLabel={STEPS[step].label}
                    currentStepIndex={step}
                    isFinished={false}
                    isLoading={adsLoading}
                    isReady={adsReady}
                  />
                  <AdZoneById id="zone3" step={step} />
                </div>

                <div className="space-y-4">
                  <StepCopy
                    step={STEPS[step]}
                    stepIndex={step}
                    isFinished={false}
                    destination=""
                    title={title}
                    description={null}
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="lg"
                      variant="gradient"
                      onClick={goNext}
                      disabled={!canContinue || !adsReady}
                    >
                      {step >= TOTAL_STEPS - 1 ? "Continue to destination" : "Continue to next step"}
                      <ArrowRight />
                    </Button>
                    <Button asChild size="lg" variant="glass">
                      <Link href="/">
                        <X /> Cancel
                      </Link>
                    </Button>
                    <div className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-sm">
                      <Timer className="h-3 w-3" />
                      3 steps · 30s each
                    </div>
                  </div>

                  {error ? (
                    <p className="text-xs text-destructive">{error}</p>
                  ) : null}

                  <FeaturedSponsor step={step} ads={ADS} />

                  <p className="text-[11px] text-muted-foreground">
                    This short wait funds the creators you follow. Thanks for your support.
                  </p>
                </div>

                <div className="space-y-4">
                  <AdZoneById id="zone2" step={step} />
                  <AdZoneById id="zone4" step={step} />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="px-4 pb-2 sm:px-6">
            <div className="mx-auto flex max-w-6xl justify-center">
              <AdZoneById id="zone5" step={step} />
            </div>
          </div>

          <footer className="flex items-center justify-between p-4 text-[11px] text-muted-foreground sm:p-6">
            <span>Powered by Linkmint</span>
            <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
              <Sparkles className="h-3 w-3" />
              Create your own short links
            </Link>
          </footer>
        </div>
      </div>
    </AdBlockerGate>
  );
}

function StepHeader({
  steps,
  currentStep,
  stepProgress,
}: {
  steps: StepDef[];
  currentStep: number;
  totalProgress?: number;
  stepProgress: number;
  isFinished: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {steps.map((s, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <div
              key={s.id}
              className={cn(
                "rounded-2xl border p-3 transition-all",
                done
                  ? "border-primary/40 bg-primary/10"
                  : active
                    ? "border-primary/60 bg-primary/5 shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary)_12%,transparent)]"
                    : "border-border/50 bg-card/30",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold",
                    done
                      ? "bg-primary text-primary-foreground"
                      : active
                        ? "bg-primary/20 text-primary"
                        : "bg-foreground/10 text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : <CircleDot className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">Step {i + 1}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-foreground/10">
                <motion.div
                  className="h-full bg-primary"
                  initial={false}
                  animate={{ width: `${done ? 100 : active ? stepProgress * 100 : 0}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CountdownPanel({
  stepRemaining,
  totalRemaining,
  currentStepLabel,
  currentStepIndex,
  isLoading,
  isReady,
}: {
  stepRemaining: number;
  totalRemaining: number;
  currentStepLabel: string;
  currentStepIndex: number;
  isFinished: boolean;
  isLoading: boolean;
  isReady: boolean;
}) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - stepRemaining / STEP_DURATION);

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-5">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/15 via-transparent to-accent/15" />
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Timer className="h-3.5 w-3.5" />
        Step {currentStepIndex + 1} of {TOTAL_STEPS}
      </div>
      <p className="mt-1 text-sm font-medium">{currentStepLabel}</p>

      <div className="relative mx-auto mt-3 aspect-square w-fit">
        <div className="absolute inset-0 -m-6 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-3xl" />
        <div className="relative grid place-items-center">
          <svg
            width={radius * 2 + 16}
            height={radius * 2 + 16}
            viewBox={`0 0 ${radius * 2 + 16} ${radius * 2 + 16}`}
            className="-rotate-90"
          >
            <defs>
              <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="oklch(0.7 0.22 280)" />
                <stop offset="50%" stopColor="oklch(0.7 0.2 230)" />
                <stop offset="100%" stopColor="oklch(0.78 0.22 320)" />
              </linearGradient>
            </defs>
            <circle
              cx={radius + 8}
              cy={radius + 8}
              r={radius}
              stroke="color-mix(in oklch, var(--foreground) 8%, transparent)"
              strokeWidth={6}
              fill="transparent"
            />
            <motion.circle
              cx={radius + 8}
              cy={radius + 8}
              r={radius}
              stroke="url(#ring-grad)"
              strokeWidth={6}
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Step</p>
              <p className="mt-0.5 text-6xl font-semibold tabular-nums tracking-tight">{stepRemaining}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">seconds</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[11px]">
        <div className="rounded-xl border border-border/50 bg-card/40 p-2">
          <p className="text-muted-foreground">This step</p>
          <p className="mt-0.5 font-semibold tabular-nums">{stepRemaining}s</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/40 p-2">
          <p className="text-muted-foreground">Total wait</p>
          <p className="mt-0.5 font-semibold tabular-nums">{totalRemaining}s</p>
        </div>
      </div>
      <div className="mt-3 text-center text-[10px] text-muted-foreground">
        {isLoading ? "Loading ad zones…" : isReady ? "All ads ready" : "Preparing…"}
      </div>
    </div>
  );
}

function StepCopy({
  step,
  stepIndex,
  title,
}: {
  step: StepDef;
  stepIndex: number;
  isFinished: boolean;
  destination: string;
  title: string | null;
  description: string | null;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="glass space-y-2 rounded-2xl border border-border/40 p-4"
      >
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Step {stepIndex + 1} · {step.label}
        </p>
        <h1 className="text-balance text-2xl font-semibold leading-tight tracking-tight">{step.copy.title}</h1>
        <p className="text-sm text-muted-foreground">{step.sublabel}</p>
        <p className="inline-flex items-center gap-1.5 text-xs text-foreground/80">
          <MousePointerClick className="h-3.5 w-3.5 text-primary" />
          {step.copy.cta}
        </p>
        <div className="pt-1">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">You are being redirected to</p>
          <p className="mt-0.5 text-sm font-medium leading-snug">{title ?? "your destination"}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function FeaturedSponsor({
  step,
  ads,
}: {
  step: number;
  ads: typeof ADS;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl border border-dashed border-border/60 bg-card/40 p-4 backdrop-blur-sm"
      >
        <div
          className={cn(
            "absolute inset-0 -z-10 bg-gradient-to-br opacity-70",
            ACCENT_CLASSES[ads[step].accent],
          )}
        />
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-card/70",
              ACCENT_CLASSES[ads[step].accent].split(" ").pop(),
            )}
          >
            {(() => {
              const Icon = ads[step].Icon;
              return <Icon className="h-5 w-5" />;
            })()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border/60 bg-card/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {ads[step].badge}
              </span>
              <span className="rounded-full border border-border/60 bg-card/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {ads[step].size}
              </span>
            </div>
            <p className="mt-1.5 text-sm font-semibold leading-snug">{ads[step].title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{ads[step].body}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
              {ads[step].cta}
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
