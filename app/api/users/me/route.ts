import { z } from "zod";
import { dbQuery } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleError, ok, readJson } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1).max(80).optional(),
  country: z.string().min(2).max(8).optional(),
  avatar: z.string().url().nullable().optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    return ok({ user });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const parsed = await readJson(req, schema);
    if (!parsed.ok) return parsed.res;
    const updated = await dbQuery((p) => p.user.update({ where: { id: user.id }, data: parsed.data }));
    return ok({
      user: {
        ...user,
        name: updated.name,
        country: updated.country,
        avatar: updated.avatar,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
