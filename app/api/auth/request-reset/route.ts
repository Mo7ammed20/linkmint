import { z } from "zod";
import { randomBytes } from "node:crypto";
import { dbQuery } from "@/lib/db";
import { handleError, ok, readJson } from "@/lib/api";
import { sendResetEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const parsed = await readJson(req, schema);
    if (!parsed.ok) return parsed.res;
    const user = await dbQuery((p) => p.user.findUnique({ where: { email: parsed.data.email } }));
    if (user) {
      const token = randomBytes(24).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await dbQuery((p) =>
        p.passwordResetToken
          .create({ data: { userId: user.id, token, expiresAt } })
          .catch(() => undefined),
      );
      await sendResetEmail(user.email, token);
    }
    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
