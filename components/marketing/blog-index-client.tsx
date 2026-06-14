"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Calendar, Clock, ArrowUpRight } from "lucide-react";
import { SectionHeader } from "@/components/marketing/section-header";
import { usePlatformStore } from "@/stores/platform-store";
import type { SeedBlogPost } from "@/lib/seed";
import { formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function BlogIndexClient({ initialPosts }: { initialPosts: SeedBlogPost[] }) {
  const posts = usePlatformStore((s) => s.blogPosts);
  const list = posts.length > 0 ? posts : initialPosts;
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string | null>(null);
  const categories = React.useMemo(() => Array.from(new Set(list.map((p) => p.category))), [list]);
  const filtered = list.filter((p) => {
    const matchesQuery =
      !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !category || p.category === category;
    return matchesQuery && matchesCategory;
  });
  const featured = list.find((p) => p.status === "published");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <SectionHeader
        eyebrow="Blog"
        title={<>Notes from the <span className="text-gradient-static">Linkmint team</span></>}
        description="Engineering, design, and monetization insights. No fluff."
      />

      <div className="mt-10 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              "rounded-full border border-border/60 px-3 py-1 text-xs transition-colors",
              !category ? "bg-foreground/10" : "hover:bg-secondary",
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c === category ? null : c)}
              className={cn(
                "rounded-full border border-border/60 px-3 py-1 text-xs transition-colors",
                c === category ? "bg-foreground/10" : "hover:bg-secondary",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {featured && !query && !category ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-10"
        >
          <Link
            href={`/blog/${featured.slug}`}
            className="group glass-strong relative block overflow-hidden rounded-3xl p-8 sm:p-12"
          >
            <div
              className="absolute inset-0 -z-10 opacity-50"
              style={{
                background:
                  "radial-gradient(60% 60% at 80% 20%, color-mix(in oklch, var(--primary) 30%, transparent), transparent 60%)",
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Featured</Badge>
              <Badge variant="outline">{featured.category}</Badge>
            </div>
            <h3 className="mt-4 text-balance text-2xl font-semibold tracking-tight sm:text-4xl">
              {featured.title}
            </h3>
            <p className="mt-3 max-w-2xl text-muted-foreground">{featured.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {featured.publishedAt ? formatDate(featured.publishedAt) : "Draft"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {featured.readTime} min read
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5 text-foreground transition-transform group-hover:translate-x-0.5">
                Read article
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        </motion.div>
      ) : null}

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
          >
            <Link
              href={`/blog/${p.slug}`}
              className="group block h-full overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5 transition-all hover:border-border hover:bg-card/60"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline">{p.category}</Badge>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {p.status === "published" ? "Live" : p.status}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight">{p.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{p.publishedAt ? formatDate(p.publishedAt) : "Draft"}</span>
                <span className="inline-flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                  Read <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No articles match your search.</p>
      ) : null}
    </div>
  );
}
