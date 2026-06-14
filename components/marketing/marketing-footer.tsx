"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Github, Twitter, Linkedin } from "lucide-react";

const COLS = [
  {
    title: "Product",
    links: [
      { label: "URL Shortener", href: "/" },
      { label: "Analytics", href: "/#features" },
      { label: "Monetization", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Changelog", href: "/blog" },
      { label: "Help center", href: "/blog" },
      { label: "Status", href: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/blog" },
      { label: "Careers", href: "/blog" },
      { label: "Contact", href: "/blog" },
      { label: "Brand", href: "/blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/blog" },
      { label: "Terms", href: "/blog" },
      { label: "Cookies", href: "/blog" },
      { label: "DPA", href: "/blog" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="relative border-t border-border/40 bg-background/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Shorten links, maximize revenue, and ship a premium experience your audience will remember.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/40 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                  aria-label="social"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="mt-6">
              <ThemeToggle />
            </div>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border/40 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Linkmint Labs. Crafted with care.</p>
          <p>All systems normal · v2.4.0</p>
        </div>
      </div>
    </footer>
  );
}
