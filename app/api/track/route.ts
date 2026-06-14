import { z } from "zod";
import { dbQuery } from "@/lib/db";
import { handleError, ok, readJson } from "@/lib/api";
import { hashIp } from "@/lib/auth";

const schema = z.object({
  shortCode: z.string().min(1).max(64),
  country: z.string().max(8).default("??"),
  device: z.string().max(32).default("Unknown"),
  browser: z.string().max(32).default("Unknown"),
  referrer: z.string().max(200).default("Direct"),
});

const CPM_BY_DEVICE: Record<string, number> = {
  Desktop: 3.4,
  Mobile: 2.8,
  Tablet: 2.4,
  "Smart TV": 1.8,
  Unknown: 1.2,
};

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || real?.trim() || "0.0.0.0";
}

export async function POST(req: Request) {
  try {
    const parsed = await readJson(req, schema);
    if (!parsed.ok) return parsed.res;
    const { shortCode, country, device, browser, referrer } = parsed.data;
    const link = await dbQuery((p) => p.link.findUnique({ where: { shortCode } }));
    if (!link || link.status !== "active") {
      return Response.json({ error: "Link not found" }, { status: 404 });
    }
    const ipHash = hashIp(clientIp(req));
    const cpm = CPM_BY_DEVICE[device] ?? 1.2;
    const earnings = Number(((1 / 1000) * cpm).toFixed(4));
    await dbQuery((p) =>
      p.$transaction([
        p.click.create({
          data: { linkId: link.id, country, device, browser, referrer, ipHash, earnings },
        }),
        p.link.update({
          where: { id: link.id },
          data: {
            clicks: { increment: 1 },
            earnings: { increment: earnings },
            lastClickedAt: new Date(),
          },
        }),
        p.user.update({
          where: { id: link.userId },
          data: { totalClicks: { increment: 1 }, totalEarnings: { increment: earnings } },
        }),
      ]),
    );
    return ok({ ok: true, earnings });
  } catch (e) {
    return handleError(e);
  }
}
