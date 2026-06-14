import { z } from "zod";
import { advanceStep, StepError } from "@/lib/redirect-session";
import { handleError, ok, readJson } from "@/lib/api";

const schema = z.object({
  sessionToken: z.string().min(1).max(2000),
  step: z.number().int().min(1).max(4),
});

export async function POST(req: Request) {
  try {
    const parsed = await readJson(req, schema);
    if (!parsed.ok) return parsed.res;
    const { sessionToken, step } = parsed.data;
    const next = await advanceStep(sessionToken, step);
    return ok({ sessionToken: next, step: step + 1 });
  } catch (e) {
    if (e instanceof StepError) {
      return Response.json({ error: e.message }, { status: e.status });
    }
    return handleError(e);
  }
}
