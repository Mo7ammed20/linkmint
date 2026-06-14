import type { Metadata } from "next";
import { db } from "@/lib/db";
import { BlogIndexClient } from "@/components/marketing/blog-index-client";

export const metadata: Metadata = {
  title: "Blog",
  description: "Engineering, design, and monetization insights from the Linkmint team.",
};

export default async function BlogIndexPage() {
  const posts = await db.blogPost.findMany({
    where: { status: "published" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
  const initialPosts = posts.map((p) => ({
    ...p,
    cover: p.cover ?? undefined,
    status: p.status as "published" | "draft" | "scheduled",
    publishedAt: p.publishedAt?.getTime(),
    scheduledAt: p.scheduledAt?.getTime(),
    createdAt: p.createdAt.getTime(),
    updatedAt: p.updatedAt.getTime(),
  }));
  return <BlogIndexClient initialPosts={initialPosts} />;
}
