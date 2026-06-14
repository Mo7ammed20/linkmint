"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="glass-strong relative overflow-hidden rounded-3xl p-10 text-center sm:p-16"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
            <div className="absolute inset-0 grid-pattern opacity-30" />
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-primary" />
            Free forever for solo creators
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Start shortening smarter <span className="text-gradient-static">today</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground">
            Join thousands of creators, marketers, and teams who trust Linkmint to power their links and grow their revenue.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="xl" variant="gradient">
              <Link href="/register">
                Get started for free
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="xl" variant="glass">
              <Link href="/dashboard">Explore the demo</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
