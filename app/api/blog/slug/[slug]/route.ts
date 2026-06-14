import { db, dbQuery } from "@/lib/db";
import { handleError, ok } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const post = await dbQuery((p) => p.blogPost.findUnique({ where: { slug } }));
    if (!post || post.status !== "published") {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    await dbQuery((p) => p.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } }));
    return ok({ post });
  } catch (e) {
    return handleError(e);
  }
}
