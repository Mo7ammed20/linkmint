"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2, Github, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroShortener } from "@/components/marketing/hero-shortener";
import { AnimatedCounter } from "@/components/motion/animated";
import { GradientText } from "@/components/gradient-text";
import { Magnetic } from "@/components/motion/magnetic";

export function Hero() {
  return (
    <section className="relative pt-12 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm"
          >
            <Sparkles className="h-3 w-3 text-primary" />
            <span>New · Custom routing, A/B tests, and team workspaces</span>
            <ArrowRight className="h-3 w-3" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          >
            Shorten links. <br />
            <GradientText>Maximize revenue.</GradientText>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-5 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg"
          >
            Monetize every click with a next-generation link management platform. Built for creators, marketers, and teams who care about the details.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Magnetic>
              <Button asChild size="xl" variant="gradient">
                <Link href="/register">
                  Start free
                  <ArrowRight />
                </Link>
              </Button>
            </Magnetic>
            <Button asChild size="xl" variant="glass">
              <Link href="/dashboard">View live demo</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
          >
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              No credit card
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              Free forever for solo creators
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Github className="h-3.5 w-3.5" />
              <Star className="h-3 w-3 fill-warning text-warning" />
              4.9 on G2
            </span>
          </motion.div>
        </div>

        <div className="mt-12 sm:mt-16">
          <HeroShortener />
        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { label: "Links shortened", value: 4_182_443_021, format: (n: number) => (n / 1e9).toFixed(1) + "B" },
            { label: "Clicks routed", value: 982_114_222, format: (n: number) => (n / 1e6).toFixed(0) + "M" },
            { label: "Paid out to creators", value: 38_400_000, format: (n: number) => "$" + (n / 1e6).toFixed(1) + "M" },
            { label: "Average CPM lift", value: 0.273, format: (n: number) => (n * 100).toFixed(0) + "%" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
              className="rounded-2xl border border-border/40 bg-card/30 p-4 backdrop-blur-sm"
            >
              <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                <AnimatedCounter value={s.value} format={s.format} />
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
