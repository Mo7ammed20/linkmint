import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";

export async function GET() {
  try {
    await requireAdmin();
    const entries = await dbQuery((p) =>
      p.auditEntry.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
    );
    return ok({ entries });
  } catch (e) {
    return handleError(e);
  }
}
