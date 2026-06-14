import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BlogPostClient } from "@/components/marketing/blog-post-client";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Article" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post) notFound();
  const serialized = {
    ...post,
    cover: post.cover ?? undefined,
    status: post.status as "published" | "draft" | "scheduled",
    publishedAt: post.publishedAt?.getTime(),
    scheduledAt: post.scheduledAt?.getTime(),
    createdAt: post.createdAt.getTime(),
    updatedAt: post.updatedAt.getTime(),
  };
  return <BlogPostClient post={serialized} />;
}
