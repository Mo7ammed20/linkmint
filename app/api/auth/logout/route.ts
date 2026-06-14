import { destroySession } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";

export async function POST() {
  try {
    await destroySession();
    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
