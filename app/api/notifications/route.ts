import { dbQuery } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireUser();
    const notifications = await dbQuery((p) =>
      p.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
    );
    return ok({ notifications });
  } catch (e) {
    return handleError(e);
  }
}
