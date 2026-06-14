import { z } from "zod";
import { dbQuery } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleError, ok, readJson } from "@/lib/api";

const patchSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  destination: z.string().url().max(2000).optional(),
  tags: z.array(z.string()).max(20).optional(),
  status: z.enum(["active", "paused", "expired", "disabled"]).optional(),
});

async function ownLink(id: string, userId: string, isAdmin: boolean) {
  const link = await dbQuery((p) => p.link.findUnique({ where: { id } }));
  if (!link) return null;
  if (link.userId !== userId && !isAdmin) return null;
  return link;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const link = await ownLink(id, user.id, user.role === "admin");
    if (!link) return Response.json({ error: "Not found" }, { status: 404 });
    return ok({ link });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const link = await ownLink(id, user.id, user.role === "admin");
    if (!link) return Response.json({ error: "Not found" }, { status: 404 });
    const parsed = await readJson(req, patchSchema);
    if (!parsed.ok) return parsed.res;
    const updated = await dbQuery((p) => p.link.update({ where: { id }, data: parsed.data }));
    return ok({ link: updated });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const link = await ownLink(id, user.id, user.role === "admin");
    if (!link) return Response.json({ error: "Not found" }, { status: 404 });
    await dbQuery((p) => p.link.delete({ where: { id } }));
    await dbQuery((p) =>
      p.user.update({
        where: { id: link.userId },
        data: { totalLinks: { decrement: 1 } },
      }),
    );
    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
