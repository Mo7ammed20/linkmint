import { NextResponse } from "next/server";
import { ZodError, type ZodTypeAny, type z } from "zod";
import { AuthError } from "@/lib/auth";

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function fail(status: number, message: string, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function readJson<T extends ZodTypeAny>(
  req: Request,
  schema: T,
): Promise<{ ok: true; data: z.infer<T> } | { ok: false; res: NextResponse }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { ok: false, res: fail(400, "Invalid JSON body") };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      res: fail(400, "Invalid request", { issues: parsed.error.issues }),
    };
  }
  return { ok: true, data: parsed.data };
}

export function handleError(err: unknown): NextResponse {
  if (err instanceof AuthError) {
    return fail(err.status, err.message);
  }
  if (err instanceof ZodError) {
    return fail(400, "Invalid request", { issues: err.issues });
  }
  const message = err instanceof Error ? err.message : "Internal server error";
  if (process.env.NODE_ENV !== "production") {
    console.error("[api]", err);
  }
  return fail(500, message);
}
