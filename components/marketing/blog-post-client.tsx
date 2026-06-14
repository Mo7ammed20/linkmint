"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Calendar, Clock } from "lucide-react";
import { usePlatformStore } from "@/stores/platform-store";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import type { SeedBlogPost } from "@/lib/seed";

export function BlogPostClient({ post }: { post: SeedBlogPost }) {
  const allPosts = usePlatformStore((s) => s.blogPosts);
  const related = allPosts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to blog
      </Link>

      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{post.category}</Badge>
          {post.tags.slice(0, 3).map((t) => (
            <Badge key={t} variant="outline">#{t}</Badge>
          ))}
        </div>
        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {post.publishedAt ? formatDate(post.publishedAt) : "Draft"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime} min read
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UserAvatar name="Sienna Park" className="h-6 w-6 text-[10px]" />
            {initials("Sienna Park")} · Linkmint
          </span>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="prose prose-invert mt-10 max-w-none text-base leading-relaxed text-foreground/90"
      >
        {post.content.split("\n\n").map((paragraph, i) => (
          <p key={i} className="mt-5 text-pretty">
            {paragraph}
          </p>
        ))}
      </motion.div>

      {related.length > 0 ? (
        <section className="mt-16 border-t border-border/40 pt-10">
          <h2 className="text-base font-semibold">Related articles</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/blog/${r.slug}`}
                className="group rounded-xl border border-border/60 bg-card/40 p-4 transition-colors hover:border-border hover:bg-card/60"
              >
                <p className="line-clamp-2 text-sm font-semibold">{r.title}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground">
                  Read <ArrowUpRight className="h-3 w-3" />
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
