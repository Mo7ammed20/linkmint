import { dbQuery } from "@/lib/db";
import { handleError, ok } from "@/lib/api";
import { AD_ZONE_DEFINITIONS, readAdsTxt, type AdCodeMap } from "@/lib/ads-config";

export const dynamic = "force-dynamic";

interface PlacementRow {
  zoneId: string;
  label: string;
  width: number;
  height: number;
  code: string;
  active: boolean;
  notes: string;
  updatedAt: Date;
}

async function getOrSeedPlacements(): Promise<PlacementRow[]> {
  const fromDb = (await dbQuery((p) =>
    p.adPlacement.findMany({ orderBy: { zoneId: "asc" } }),
  )) as PlacementRow[];
  if (fromDb.length >= AD_ZONE_DEFINITIONS.length) {
    return fromDb;
  }
  const fileMap = await readAdsTxt();
  const existingIds = new Set(fromDb.map((r) => r.zoneId));
  const missing = AD_ZONE_DEFINITIONS.filter((z) => !existingIds.has(z.id));
  for (const def of missing) {
    const seedCode = fileMap[def.id as keyof typeof fileMap] ?? "";
    await dbQuery((p) =>
      p.adPlacement.upsert({
        where: { zoneId: def.id },
        create: {
          zoneId: def.id,
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
  return (await dbQuery((p) =>
    p.adPlacement.findMany({ orderBy: { zoneId: "asc" } }),
  )) as PlacementRow[];
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const includeInactive = url.searchParams.get("all") === "1";
    const placements = await getOrSeedPlacements();
    const result: Record<string, { code: string; active: boolean; width: number; height: number; label: string }> = {};
    for (const p of placements) {
      if (!includeInactive && !p.active) continue;
      result[p.zoneId] = {
        code: p.code,
        active: p.active,
        width: p.width,
        height: p.height,
        label: p.label,
      };
    }
    return ok({ zones: result, source: "db" });
  } catch (e) {
    return handleError(e);
  }
}

export type AdPlacementsResponse = {
  zones: Record<string, { code: string; active: boolean; width: number; height: number; label: string }>;
  source: "db";
};

export type { AdCodeMap };
