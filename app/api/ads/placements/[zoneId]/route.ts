import { z } from "zod";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleError, ok, readJson } from "@/lib/api";
import { AD_ZONE_DEFINITIONS, readAdsTxt, writeAdsTxt } from "@/lib/ads-config";

const schema = z.object({
  code: z.string().max(50_000).default(""),
  active: z.boolean().default(true),
  notes: z.string().max(500).default(""),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ zoneId: string }> },
) {
  try {
    await requireAdmin();
    const { zoneId } = await params;
    const def = AD_ZONE_DEFINITIONS.find((z) => z.id === zoneId);
    if (!def) {
      return Response.json({ error: "Unknown zone" }, { status: 404 });
    }
    let row = await dbQuery((p) => p.adPlacement.findUnique({ where: { zoneId } }));
    if (!row) {
      const fileMap = await readAdsTxt();
      const seedCode = fileMap[zoneId as keyof typeof fileMap] ?? "";
      row = await dbQuery((p) =>
        p.adPlacement.upsert({
          where: { zoneId },
          create: {
            zoneId,
            label: def.label,
            width: def.width,
            height: def.height,
            code: seedCode,
            active: Boolean(seedCode.trim()),
          },
          update: {},
        }),
      );
    }
    return ok({ placement: row });
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ zoneId: string }> },
) {
  try {
    await requireAdmin();
    const { zoneId } = await params;
    const def = AD_ZONE_DEFINITIONS.find((z) => z.id === zoneId);
    if (!def) {
      return Response.json({ error: "Unknown zone" }, { status: 404 });
    }
    const parsed = await readJson(req, schema);
    if (!parsed.ok) return parsed.res;
    const { code, active, notes } = parsed.data;
    const placement = await dbQuery((p) =>
      p.adPlacement.upsert({
        where: { zoneId },
        create: {
          zoneId,
          label: def.label,
          width: def.width,
          height: def.height,
          code,
          active,
          notes,
        },
        update: { code, active, notes },
      }),
    );
    if (process.env.NODE_ENV !== "production" || process.env.ADS_TXT_WRITEBACK === "1") {
      const all = await dbQuery((p) => p.adPlacement.findMany());
      const map: Record<string, string> = {};
      for (const r of all) map[r.zoneId] = r.code;
      await writeAdsTxt(map).catch(() => undefined);
    }
    return ok({ placement });
  } catch (e) {
    return handleError(e);
  }
}
