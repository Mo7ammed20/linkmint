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
      const code = fileMap[def.id] ?? "";
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
    }
    return ok({ placements: result, source: "ads.txt" });
  } catch (e) {
    return handleError(e);
  }
}
