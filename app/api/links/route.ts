import { z } from "zod";
import { dbQuery } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleError, ok, readJson } from "@/lib/api";
import { generateShortCode, isReservedCode, normalizeCustomAlias } from "@/lib/short-code";

const createSchema = z.object({
  destination: z.string().url().max(2000),
  customAlias: z.string().max(64).optional(),
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string().min(1).max(40)).max(20).optional(),
  expiresAt: z.number().int().positive().optional(),
  password: z.string().min(1).max(200).optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    const links = await dbQuery((p) =>
      p.link.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
    );
    return ok({ links });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const parsed = await readJson(req, createSchema);
    if (!parsed.ok) return parsed.res;
    const input = parsed.data;

    const desired = input.customAlias ? normalizeCustomAlias(input.customAlias) : null;
    if (desired && isReservedCode(desired)) {
      return Response.json({ error: `"${desired}" is reserved` }, { status: 400 });
    }
    const shortCode = await uniqueCode(desired);
    if (!shortCode) {
      return Response.json(
        { error: desired ? `"${desired}" is already taken` : "Could not allocate short code" },
        { status: 409 },
      );
    }

    const passwordHash = input.password ? await hashPlain(input.password) : null;
    const link = await dbQuery((p) =>
      p.link.create({
        data: {
          userId: user.id,
          shortCode,
          destination: input.destination,
          title: input.title,
          description: input.description,
          tags: input.tags ?? [],
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          customAlias: Boolean(input.customAlias),
          passwordHash,
        },
      }),
    );
    await dbQuery((p) =>
      p.user.update({
        where: { id: user.id },
        data: { totalLinks: { increment: 1 } },
      }),
    );
    return ok({ link });
  } catch (e) {
    return handleError(e);
  }
}

async function hashPlain(plain: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(plain, 10);
}

async function uniqueCode(preferred: string | null): Promise<string | null> {
  if (preferred) {
    const exists = await dbQuery((p) => p.link.findUnique({ where: { shortCode: preferred } }));
    return exists ? null : preferred;
  }
  for (let i = 0; i < 8; i++) {
    const code = generateShortCode(7);
    if (isReservedCode(code)) continue;
    const exists = await dbQuery((p) => p.link.findUnique({ where: { shortCode: code } }));
    if (!exists) return code;
  }
  return generateShortCode(10);
}
