import { z } from "zod";
import { completeSession, StepError } from "@/lib/redirect-session";
import { handleError, ok, readJson } from "@/lib/api";

const schema = z.object({
  sessionToken: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  try {
    const parsed = await readJson(req, schema);
    if (!parsed.ok) return parsed.res;
    const { sessionToken } = parsed.data;
    const session = await completeSession(sessionToken);
    return ok({
      destination: session.destination,
      shortCode: session.shortCode,
    });
  } catch (e) {
    if (e instanceof StepError) {
      return Response.json({ error: e.message }, { status: e.status });
    }
    return handleError(e);
  }
}
