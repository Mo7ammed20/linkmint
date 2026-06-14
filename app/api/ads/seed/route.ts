import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";
import { AD_ZONE_DEFINITIONS, readAdsTxt } from "@/lib/ads-config";

export async function POST() {
  try {
    await requireAdmin();
    const fileMap = await readAdsTxt();
    const result = [];
    for (const def of AD_ZONE_DEFINITIONS) {
      const code = fileMap[def.id as keyof typeof fileMap] ?? "";
      try {
        const row = await dbQuery((p) =>
          p.adPlacement.upsert({
            where: { zoneId: def.id },
            create: {
              zoneId: def.id,
              label: def.label,
              width: def.width,
              height: def.height,
              code,
              active: Boolean(code.trim()),
            },
            update: { code, active: Boolean(code.trim()) },
          }),
        );
        result.push(row);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/relation .* does not exist|table .* does not exist|42P01/i.test(msg)) {
          return Response.json(
            {
              error:
                "AdPlacement table is not in the database yet. Run `npx prisma migrate deploy` (production) or `npx prisma migrate dev` (local), then click 'Seed from ads.txt' again.",
            },
            { status: 503 },
          );
        }
        throw e;
      }
    }
    return ok({ placements: result, source: "ads.txt" });
  } catch (e) {
    return handleError(e);
  }
}
