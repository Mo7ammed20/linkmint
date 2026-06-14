import { z } from "zod";
import { db, dbQuery } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { handleError, ok, readJson } from "@/lib/api";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  try {
    const parsed = await readJson(req, schema);
    if (!parsed.ok) return parsed.res;
    const record = await dbQuery((p) =>
      p.passwordResetToken.findUnique({
        where: { token: parsed.data.token },
      }),
    );
    if (!record || record.expiresAt.getTime() < Date.now()) {
      return Response.json({ error: "Invalid or expired token" }, { status: 400 });
    }
    const passwordHash = await hashPassword(parsed.data.password);
    await dbQuery((p) =>
      p.$transaction([
        p.user.update({ where: { id: record.userId }, data: { passwordHash } }),
        p.passwordResetToken.delete({ where: { id: record.id } }),
        p.session.deleteMany({ where: { userId: record.userId } }),
      ]),
    );
    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
