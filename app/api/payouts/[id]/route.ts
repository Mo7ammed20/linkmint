import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const existing = await dbQuery((p) => p.payout.findUnique({ where: { id } }));
    if (!existing) return Response.json({ error: "Not found" }, { status: 404 });
    const next = existing.status === "pending" ? "processing" : "completed";
    const payout = await dbQuery((p) =>
      p.payout.update({
        where: { id },
        data: { status: next, completedAt: next === "completed" ? new Date() : null },
      }),
    );
    return ok({ payout });
  } catch (e) {
    return handleError(e);
  }
}
