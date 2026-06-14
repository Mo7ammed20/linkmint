import { z } from "zod";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleError, ok, readJson } from "@/lib/api";

const createSchema = z.object({
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1),
  cover: z.string().url().optional(),
  category: z.string().min(1).max(60),
  tags: z.array(z.string()).max(20).default([]),
  status: z.enum(["draft", "published", "scheduled"]).default("draft"),
  publishedAt: z.number().int().optional(),
  scheduledAt: z.number().int().optional(),
  readTime: z.number().int().min(1).max(120).default(5),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const posts = await dbQuery((p) =>
      p.blogPost.findMany({
        where: status ? { status } : undefined,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      }),
    );
    return ok({ posts });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin();
    const parsed = await readJson(req, createSchema);
    if (!parsed.ok) return parsed.res;
    const data = parsed.data;
    const post = await dbQuery((p) =>
      p.blogPost.create({
        data: {
          ...data,
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : data.status === "published" ? new Date() : null,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
          authorId: user.id,
        },
      }),
    );
    return ok({ post });
  } catch (e) {
    return handleError(e);
  }
}
