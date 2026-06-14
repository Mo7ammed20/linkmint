import { z } from "zod";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleError, ok, readJson } from "@/lib/api";

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  excerpt: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  cover: z.string().url().optional(),
  category: z.string().min(1).max(60).optional(),
  tags: z.array(z.string()).max(20).optional(),
  status: z.enum(["draft", "published", "scheduled"]).optional(),
  readTime: z.number().int().min(1).max(120).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const parsed = await readJson(req, patchSchema);
    if (!parsed.ok) return parsed.res;
    const post = await dbQuery((p) => p.blogPost.update({ where: { id }, data: parsed.data }));
    return ok({ post });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await dbQuery((p) => p.blogPost.delete({ where: { id } }));
    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
