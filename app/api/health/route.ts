import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { isAuthSecretConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface HealthReport {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  env: {
    nodeEnv: string;
    vercel: string | null;
    vercelEnv: string | null;
    databaseUrlSet: boolean;
    authSecretSet: boolean;
    appUrlSet: boolean;
  };
  database: {
    reachable: boolean;
    error: string | null;
    latencyMs: number | null;
  };
}

export async function GET() {
  const report: HealthReport = {
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      vercel: process.env.VERCEL ?? null,
      vercelEnv: process.env.VERCEL_ENV ?? null,
      databaseUrlSet: Boolean(process.env.DATABASE_URL),
      authSecretSet: isAuthSecretConfigured(),
      appUrlSet: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    },
    database: {
      reachable: false,
      error: null,
      latencyMs: null,
    },
  };

  if (!report.env.authSecretSet && process.env.NODE_ENV === "production") {
    report.status = "error";
  }

  if (process.env.DATABASE_URL) {
    try {
      const started = Date.now();
      await dbQuery((p) => p.$queryRaw`SELECT 1`);
      report.database.reachable = true;
      report.database.latencyMs = Date.now() - started;
    } catch (e) {
      report.database.reachable = false;
      report.database.error = e instanceof Error ? e.message : "Unknown error";
      report.status = "degraded";
    }
  } else {
    report.database.error = "DATABASE_URL not set";
    report.status = "degraded";
  }

  return NextResponse.json(report, {
    status: report.status === "error" ? 500 : 200,
    headers: { "cache-control": "no-store" },
  });
}
