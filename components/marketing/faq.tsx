"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { SectionHeader } from "@/components/marketing/section-header";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How is Linkmint different from a regular URL shortener?",
    a: "We pair premium short-link UX with built-in ad monetization, real-time analytics, and a motion design system. Most shorteners route you to dead ends or strip out revenue. We do the opposite.",
  },
  {
    q: "Do you take a cut of my earnings?",
    a: "No hidden cuts. We charge a flat platform fee on top of what advertisers pay — your dashboard shows the gross CPM, the platform fee, and your net earnings, in that order.",
  },
  {
    q: "Can I bring my own domain?",
    a: "Yes. Custom domains are available on Pro and above, with automatic SSL and wildcard support. We never brand your links.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes — 1,000 tracked clicks per month, up to 5 active links, basic analytics, and no credit card required to start.",
  },
  {
    q: "How does ad-block detection work?",
    a: "We use transparent detection that asks users to disable their ad blocker if our monetization supports a creator they want to fund. We never silently bypass blockers or rewrite pages.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, in one click. Your data is yours — export it as CSV or JSON, or move it to a different tool. We don't lock you in.",
  },
];

export function FAQ() {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="FAQ"
          title={<>Common <span className="text-gradient-static">questions</span></>}
          description="Can't find what you're looking for? Reach out — we read every message."
        />
        <div className="mt-12 space-y-2">
          {FAQS.map((item, i) => {
            const active = open === i;
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className={cn(
                  "rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm transition-colors",
                  active && "border-border bg-card/70",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(active ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  aria-expanded={active}
                >
                  <span className="text-sm font-semibold sm:text-base">{item.q}</span>
                  <Plus
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                      active && "rotate-45 text-foreground",
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {active ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-muted-foreground">{item.a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
