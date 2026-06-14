import { z } from "zod";
import { db, dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleError, ok, readJson } from "@/lib/api";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(["banner", "native", "interstitial", "popunder", "push", "mobile"]),
  status: z.enum(["active", "paused", "disabled"]).default("active"),
  cpm: z.number().min(0),
  ctr: z.number().min(0).max(1).default(0),
  impressions: z.number().int().min(0).default(0),
  clicks: z.number().int().min(0).default(0),
  revenue: z.number().min(0).default(0),
  width: z.number().int().min(1).max(4096).optional(),
  height: z.number().int().min(1).max(4096).optional(),
  body: z.string().min(1).max(500),
  imageUrl: z.string().url().max(2000).optional(),
  cta: z.string().min(1).max(60),
  url: z.string().url().max(2000),
});

export async function GET() {
  try {
    await requireAdmin();
    const ads = await dbQuery((p) => p.ad.findMany({ orderBy: { createdAt: "desc" } }));
    return ok({ ads });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const parsed = await readJson(req, createSchema);
    if (!parsed.ok) return parsed.res;
    const ad = await dbQuery((p) => p.ad.create({ data: parsed.data }));
    return ok({ ad });
  } catch (e) {
    return handleError(e);
  }
}
