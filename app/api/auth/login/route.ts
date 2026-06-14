import { z } from "zod";
import { dbQuery } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { handleError, ok, readJson } from "@/lib/api";

const schema = z.object({
  email: z.string().email().max(160),
  password: z.string().min(1).max(200),
});

export async function POST(req: Request) {
  try {
    const parsed = await readJson(req, schema);
    if (!parsed.ok) return parsed.res;
    const { email, password } = parsed.data;

    const user = await dbQuery((p) => p.user.findUnique({ where: { email } }));
    if (!user) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }
    if (user.status === "suspended") {
      return Response.json({ error: "Account is suspended" }, { status: 403 });
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }
    await createSession(user.id, user.role as "user" | "admin");
    return ok({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (e) {
    return handleError(e);
  }
}
