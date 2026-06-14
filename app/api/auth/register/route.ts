import { z } from "zod";
import { dbQuery } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { handleError, ok, readJson } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(160),
  password: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json(
        {
          error:
            "DATABASE_URL is not configured. On Vercel, set it in Project Settings → Environment Variables, then redeploy.",
        },
        { status: 503 },
      );
    }
    if (!process.env.AUTH_SECRET) {
      return Response.json(
        {
          error:
            "AUTH_SECRET is not configured. On Vercel, set it in Project Settings → Environment Variables, then redeploy.",
        },
        { status: 503 },
      );
    }
    const parsed = await readJson(req, schema);
    if (!parsed.ok) return parsed.res;
    const { name, email, password } = parsed.data;

    const existing = await dbQuery((p) => p.user.findUnique({ where: { email } }));
    if (existing) {
      return Response.json({ error: "Email already in use" }, { status: 409 });
    }

    const isFirstUser = (await dbQuery((p) => p.user.count())) === 0;
    const passwordHash = await hashPassword(password);
    const user = await dbQuery((p) =>
      p.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: isFirstUser ? "admin" : "user",
        },
      }),
    );
    await createSession(user.id, user.role as "user" | "admin");
    return ok({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (e) {
    return handleError(e);
  }
}
