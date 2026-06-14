"use client";

import * as React from "react";
import { Marquee } from "@/components/marquee";

const COMPANIES = [
  "Stripe",
  "Vercel",
  "Linear",
  "Raycast",
  "Notion",
  "Figma",
  "Framer",
  "Loom",
  "Anthropic",
  "OpenAI",
  "Clerk",
  "Resend",
];

export function LogoCloud() {
  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Trusted by teams shipping to millions
        </p>
        <div className="mt-8">
          <Marquee speed={50} className="[--gap:3rem]">
            {COMPANIES.map((c) => (
              <div
                key={c}
                className="flex h-10 items-center text-2xl font-semibold tracking-tight text-muted-foreground/60 transition-colors hover:text-foreground/80"
              >
                {c}
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
