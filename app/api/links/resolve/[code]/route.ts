import { dbQuery } from "@/lib/db";
import { handleError, ok } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const link = await dbQuery((p) =>
      p.link.findUnique({
        where: { shortCode: code },
        select: {
          id: true,
          shortCode: true,
          destination: true,
          title: true,
          description: true,
          status: true,
          expiresAt: true,
          passwordHash: true,
          customAlias: true,
          clicks: true,
        },
      }),
    );
    if (!link || link.status !== "active") {
      return Response.json({ error: "Link not found" }, { status: 404 });
    }
    if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
      return Response.json({ error: "Link expired" }, { status: 410 });
    }
    return ok({
      id: link.id,
      shortCode: link.shortCode,
      destination: link.destination,
      title: link.title,
      description: link.description,
      passwordProtected: Boolean(link.passwordHash),
      customAlias: link.customAlias,
      clicks: link.clicks,
    });
  } catch (e) {
    return handleError(e);
  }
}
