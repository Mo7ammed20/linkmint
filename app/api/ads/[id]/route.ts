import { z } from "zod";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleError, ok, readJson } from "@/lib/api";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  status: z.enum(["active", "paused", "disabled"]).optional(),
  cpm: z.number().min(0).optional(),
  ctr: z.number().min(0).max(1).optional(),
  impressions: z.number().int().min(0).optional(),
  clicks: z.number().int().min(0).optional(),
  revenue: z.number().min(0).optional(),
  body: z.string().min(1).max(500).optional(),
  cta: z.string().min(1).max(60).optional(),
  url: z.string().url().max(2000).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const parsed = await readJson(req, patchSchema);
    if (!parsed.ok) return parsed.res;
    const ad = await dbQuery((p) => p.ad.update({ where: { id }, data: parsed.data }));
    return ok({ ad });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await dbQuery((p) => p.ad.delete({ where: { id } }));
    return ok({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
