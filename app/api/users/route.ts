import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";

export async function GET() {
  try {
    await requireAdmin();
    const users = await dbQuery((p) => p.user.findMany({ orderBy: { createdAt: "desc" } }));
    return ok({ users });
  } catch (e) {
    return handleError(e);
  }
}
