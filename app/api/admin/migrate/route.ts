import { db, dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS "AdPlacement" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "code" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AdPlacement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AdPlacement_zoneId_key" ON "AdPlacement"("zoneId");
`;

export async function POST() {
  try {
    await requireAdmin();
    const log: string[] = [];
    const checks = {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      tableExists: false,
      rowCount: 0,
    };

    if (!process.env.DATABASE_URL) {
      return Response.json(
        {
          error:
            "DATABASE_URL is not configured. Set it in Vercel → Project Settings → Environment Variables, then retry.",
        },
        { status: 503 },
      );
    }

    try {
      const result = (await dbQuery((p) => p.adPlacement.count())) as number;
      checks.tableExists = true;
      checks.rowCount = Number(result);
      log.push(`AdPlacement table already exists (${result} rows)`);
      return ok({ alreadyApplied: true, checks, log });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!/relation .* does not exist|table .* does not exist|42P01/i.test(msg)) {
        throw e;
      }
      log.push("AdPlacement table missing — running CREATE TABLE IF NOT EXISTS…");
    }

    const statements = MIGRATION_SQL.split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !/^--/.test(s));
    for (const stmt of statements) {
      log.push(`SQL: ${stmt.slice(0, 80).replace(/\s+/g, " ")}…`);
      await db.$executeRawUnsafe(stmt);
    }
    log.push("Migration applied successfully.");

    try {
      const result = (await dbQuery((p) => p.adPlacement.count())) as number;
      checks.tableExists = true;
      checks.rowCount = Number(result);
    } catch {
    }

    return ok({ applied: true, checks, log });
  } catch (e) {
    return handleError(e);
  }
}

export async function GET() {
  try {
    await requireAdmin();
    const checks = {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      tableExists: false,
      rowCount: 0,
    };
    if (!process.env.DATABASE_URL) {
      return ok({ checks });
    }
    try {
      const result = (await dbQuery((p) => p.adPlacement.count())) as number;
      checks.tableExists = true;
      checks.rowCount = Number(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!/relation .* does not exist|table .* does not exist|42P01/i.test(msg)) {
        throw e;
      }
    }
    return ok({ checks });
  } catch (e) {
    return handleError(e);
  }
}
