import { dbQuery } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const existing = await dbQuery((p) => p.notification.findUnique({ where: { id } }));
    if (!existing || existing.userId !== user.id) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    const notification = await dbQuery((p) =>
      p.notification.update({
        where: { id },
        data: { read: true },
      }),
    );
    return ok({ notification });
  } catch (e) {
    return handleError(e);
  }
}
