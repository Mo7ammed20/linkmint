import { z } from "zod";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleError, ok, readJson } from "@/lib/api";

const patchSchema = z.object({
  status: z.enum(["active", "suspended", "pending"]).optional(),
  plan: z.enum(["free", "pro", "business", "enterprise"]).optional(),
  name: z.string().min(1).max(80).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAdmin();
    const { id } = await params;
    const parsed = await readJson(req, patchSchema);
    if (!parsed.ok) return parsed.res;
    const target = await dbQuery((p) => p.user.findUnique({ where: { id } }));
    if (!target) return Response.json({ error: "Not found" }, { status: 404 });
    const user = await dbQuery((p) => p.user.update({ where: { id }, data: parsed.data }));
    if (parsed.data.status) {
      await dbQuery((p) =>
        p.auditEntry.create({
          data: {
            actorId: actor.id,
            actorName: actor.name,
            action: `user.${parsed.data.status}`,
            target: id,
            ip: "0.0.0.0",
          },
        }),
      );
    }
    return ok({ user });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await dbQuery((p) => p.user.delete({ where: { id } }));
    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
