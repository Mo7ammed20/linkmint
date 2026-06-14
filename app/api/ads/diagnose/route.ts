import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";
import { readAdsTxt } from "@/lib/ads-config";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireAdmin();
    const checks: Record<string, unknown> = { ok: true, steps: [] as string[] };
    const steps = checks.steps as string[];
    const fileMap = await readAdsTxt();
    steps.push(`read ads.txt: ${Object.keys(fileMap).length} zones`);
    let hasTable = false;
    try {
      const result = (await dbQuery((p) => p.adPlacement.count())) as number;
      hasTable = true;
      steps.push(`adPlacement.count() = ${result}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/relation .* does not exist|table .* does not exist|42P01/i.test(msg)) {
        steps.push("adPlacement table MISSING — must run `npx prisma migrate deploy`");
        hasTable = false;
      } else {
        throw e;
      }
    }
    checks.hasTable = hasTable;
    checks.fileMap = fileMap;
    return ok(checks);
  } catch (e) {
    return handleError(e);
  }
}
