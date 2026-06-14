"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Link2,
  BarChart3,
  Globe2,
  ShieldCheck,
  Zap,
  Sparkles,
  Coins,
  Users,
} from "lucide-react";
import { SectionHeader } from "@/components/marketing/section-header";
import { GlowCard } from "@/components/motion/magnetic";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Link2,
    title: "Premium short links",
    body: "Custom aliases, password protection, deep links, and link rotation per device — all without writing a line of code.",
    tone: "from-primary/30 to-accent/20",
  },
  {
    icon: BarChart3,
    title: "Real-time analytics",
    body: "Track every click, country, device, referrer, and conversion with sub-second precision. Built for marketers who care.",
    tone: "from-chart-2/30 to-primary/20",
  },
  {
    icon: Coins,
    title: "Built-in monetization",
    body: "Earn CPM revenue from global advertisers and your own direct sponsors — with transparent payouts and instant withdrawals.",
    tone: "from-chart-3/30 to-accent/20",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-grade security",
    body: "SSO, 2FA, audit logs, role-based access, and SOC2-ready infrastructure to keep your team and data safe.",
    tone: "from-chart-4/30 to-primary/20",
  },
  {
    icon: Globe2,
    title: "Custom domains",
    body: "Bring your own domain, manage SSL automatically, and ship branded short links your audience trusts.",
    tone: "from-accent/30 to-chart-5/20",
  },
  {
    icon: Zap,
    title: "Global edge network",
    body: "Sub-100ms redirects from 320+ PoPs. Your audience never waits, no matter where they are.",
    tone: "from-chart-5/30 to-primary/20",
  },
  {
    icon: Users,
    title: "Team workspaces",
    body: "Roles, projects, and shared analytics. Built for agencies, marketing teams, and creator collectives.",
    tone: "from-chart-2/30 to-accent/20",
  },
  {
    icon: Sparkles,
    title: "AI-powered insights",
    body: "Surface anomalies, suggest optimizations, and predict revenue with a co-pilot that knows your account.",
    tone: "from-primary/30 to-chart-3/20",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="What you get"
          title={<>Everything you need to <span className="text-gradient-static">monetize attention</span></>}
          description="Linkmint is the only platform that pairs a world-class shortener with built-in ad revenue, transparent analytics, and a motion design you'll actually want to use."
        />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
              >
                <GlowCard className="group relative h-full p-5">
                  <div
                    className={cn(
                      "absolute inset-x-0 -top-px h-px bg-gradient-to-r",
                      f.tone,
                    )}
                  />
                  <div
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-foreground",
                      f.tone,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </GlowCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
