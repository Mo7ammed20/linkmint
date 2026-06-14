"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { SectionHeader } from "@/components/marketing/section-header";
import { UserAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const QUOTES = [
  {
    body: "Linkmint replaced four tools in our stack. The redirect flow alone pays for itself in CPM lift, and the dashboard is the only analytics our team actually opens.",
    name: "Maya Okonkwo",
    role: "Head of Growth",
    company: "Beacon",
  },
  {
    body: "It's the only shortener that feels built for designers. Our creators brag about the link previews. The motion is exquisite.",
    name: "Tomás Reyes",
    role: "Creative Director",
    company: "Pillar Studio",
  },
  {
    body: "We migrated 1.2M links in an afternoon. Linkmint handled edge redirects faster than our previous vendor and tripled our payout window.",
    name: "Aiko Tanaka",
    role: "Operations Lead",
    company: "Lumen",
  },
  {
    body: "Transparent ad detection, fair payouts, and a beautiful UI. It's the first shortener I've recommended to friends in years.",
    name: "Devon Pierce",
    role: "Newsletter author",
    company: "Slowburn Weekly",
  },
];

export function Testimonials() {
  const [i, setI] = React.useState(0);
  const next = () => setI((p) => (p + 1) % QUOTES.length);
  const prev = () => setI((p) => (p - 1 + QUOTES.length) % QUOTES.length);

  React.useEffect(() => {
    const t = setInterval(next, 6500);
    return () => clearInterval(t);
  }, []);

  const q = QUOTES[i]!;

  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Loved by creators"
          title={<>What our <span className="text-gradient-static">customers say</span></>}
        />

        <div className="relative mt-12">
          <div className="glass-strong relative mx-auto max-w-3xl overflow-hidden rounded-3xl p-8 sm:p-12">
            <Quote className="absolute right-8 top-8 h-12 w-12 text-primary/15" />
            <AnimatePresence mode="wait">
              <motion.figure
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <blockquote className="text-xl leading-relaxed sm:text-2xl">
                  &ldquo;{q.body}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <UserAvatar name={q.name} />
                  <div>
                    <p className="text-sm font-semibold">{q.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {q.role} · <span className="text-foreground/80">{q.company}</span>
                    </p>
                  </div>
                  <Badge variant="glass" className="ml-auto">Verified customer</Badge>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={prev}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/40 transition-colors hover:border-border"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {QUOTES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setI(idx)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    idx === i ? "w-6 bg-foreground" : "w-1.5 bg-foreground/30",
                  )}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/40 transition-colors hover:border-border"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
