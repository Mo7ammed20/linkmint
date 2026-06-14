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

function isMissingTableError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return /relation .* does not exist|table .* does not exist|42P01/i.test(msg);
}

async function getOrSeedPlacements(): Promise<{ rows: PlacementRow[]; needsMigration: boolean }> {
  let fromDb: PlacementRow[];
  try {
    fromDb = (await dbQuery((p) =>
      p.adPlacement.findMany({ orderBy: { zoneId: "asc" } }),
    )) as PlacementRow[];
  } catch (e) {
    if (isMissingTableError(e)) {
      console.warn(
        "[ads/placements] AdPlacement table not found. Run: npx prisma migrate deploy",
      );
      return { rows: [], needsMigration: true };
    }
    throw e;
  }
  if (fromDb.length >= AD_ZONE_DEFINITIONS.length) {
    return { rows: fromDb, needsMigration: false };
  }
  const fileMap: AdCodeMap = await readAdsTxt();
  const existingIds = new Set(fromDb.map((r) => r.zoneId));
  const missing = AD_ZONE_DEFINITIONS.filter((z) => !existingIds.has(z.id));
  for (const def of missing) {
    const seedCode = fileMap[def.id as keyof typeof fileMap] ?? "";
    try {
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
    } catch (e) {
      if (isMissingTableError(e)) {
        return { rows: [], needsMigration: true };
      }
      throw e;
    }
  }
  try {
    fromDb = (await dbQuery((p) =>
      p.adPlacement.findMany({ orderBy: { zoneId: "asc" } }),
    )) as PlacementRow[];
  } catch {
    return { rows: [], needsMigration: true };
  }
  return { rows: fromDb, needsMigration: false };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const includeInactive = url.searchParams.get("all") === "1";
    const { rows, needsMigration } = await getOrSeedPlacements();
    const zones: Record<string, { code: string; active: boolean; width: number; height: number; label: string }> = {};
    for (const p of rows) {
      if (!includeInactive && !p.active) continue;
      zones[p.zoneId] = {
        code: p.code,
        active: p.active,
        width: p.width,
        height: p.height,
        label: p.label,
      };
    }
    return ok({ zones, needsMigration });
  } catch (e) {
    return handleError(e);
  }
}

export type AdPlacementsResponse = {
  zones: Record<string, { code: string; active: boolean; width: number; height: number; label: string }>;
  needsMigration: boolean;
};

export type { AdCodeMap };
