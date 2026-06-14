"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "@/components/marketing/section-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Tier = {
  name: string;
  blurb: string;
  monthly: number;
  yearly: number;
  cta: string;
  href: string;
  highlight?: boolean;
  features: string[];
};

const TIERS: Tier[] = [
  {
    name: "Free",
    blurb: "For solo creators getting started.",
    monthly: 0,
    yearly: 0,
    cta: "Get started",
    href: "/register",
    features: ["1,000 tracked clicks / mo", "5 active links", "Basic analytics", "Community support"],
  },
  {
    name: "Pro",
    blurb: "For creators monetizing their audience.",
    monthly: 19,
    yearly: 15,
    cta: "Start 14-day trial",
    href: "/register",
    highlight: true,
    features: [
      "100,000 tracked clicks / mo",
      "Unlimited links",
      "Advanced analytics & CSV export",
      "Built-in monetization",
      "Custom domains (1)",
      "Email + chat support",
    ],
  },
  {
    name: "Business",
    blurb: "For teams and agencies scaling fast.",
    monthly: 79,
    yearly: 64,
    cta: "Start 14-day trial",
    href: "/register",
    features: [
      "1,000,000 tracked clicks / mo",
      "Team workspaces & roles",
      "Custom domains (10)",
      "API access & webhooks",
      "A/B tests & conversion tracking",
      "Priority support · 1h SLA",
    ],
  },
  {
    name: "Enterprise",
    blurb: "For platforms with custom needs.",
    monthly: 0,
    yearly: 0,
    cta: "Contact sales",
    href: "#",
    features: [
      "Unlimited everything",
      "Dedicated infrastructure",
      "SAML SSO + SCIM",
      "Custom contracts & invoicing",
      "24/7 dedicated support",
      "On-prem deployment available",
    ],
  },
];

export function Pricing() {
  const [yearly, setYearly] = React.useState(true);

  return (
    <section id="pricing" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Pricing"
          title={<>Simple plans, <span className="text-gradient-static">serious value</span></>}
          description="Start free. Upgrade when you're ready. No hidden fees, ever."
        />

        <div className="mt-8 flex items-center justify-center">
          <Tabs value={yearly ? "yearly" : "monthly"} onValueChange={(v) => setYearly(v === "yearly")}>
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly
                <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  −20%
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier, i) => {
            const price = yearly ? tier.yearly : tier.monthly;
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-3xl border p-6",
                  tier.highlight
                    ? "border-primary/40 bg-gradient-to-br from-primary/15 via-card/60 to-accent/10"
                    : "border-border/60 bg-card/40",
                )}
              >
                {tier.highlight ? (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 rounded-b-full bg-primary px-3 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary-foreground">
                    Most popular
                  </div>
                ) : null}
                <div
                  className={cn(
                    "absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                    tier.highlight
                      ? ""
                      : "bg-[radial-gradient(400px_circle_at_var(--mx,50%)_var(--my,50%),color-mix(in_oklch,var(--primary)_10%,transparent),transparent_60%)]",
                  )}
                />
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                  {tier.highlight ? <Sparkles className="h-4 w-4 text-primary" /> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{tier.blurb}</p>

                <div className="mt-5 flex items-baseline gap-1.5">
                  {price === 0 ? (
                    <span className="text-4xl font-semibold tracking-tight">{tier.name === "Free" ? "Free" : "Custom"}</span>
                  ) : (
                    <>
                      <span className="text-4xl font-semibold tracking-tight">${price}</span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </>
                  )}
                </div>
                {price > 0 ? (
                  <p className="text-xs text-muted-foreground">{yearly ? "Billed annually" : "Billed monthly"}</p>
                ) : null}

                <Button
                  asChild
                  size="lg"
                  variant={tier.highlight ? "gradient" : "outline"}
                  className="mt-5 w-full"
                >
                  <Link href={tier.href}>
                    {tier.cta}
                    <ArrowRight />
                  </Link>
                </Button>

                <ul className="mt-6 space-y-2.5 text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                      <span className="text-foreground/85">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
