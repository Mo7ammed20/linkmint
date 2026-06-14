import { unstable_cache } from "next/cache";
import { dbQuery } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";

const DAY_SECONDS = 24 * 60 * 60;

const getCachedSeries = (userId: string, days: number) =>
  unstable_cache(
    async () => {
      const since = new Date(Date.now() - days * DAY_SECONDS * 1000);
      const clicks = await dbQuery((p) =>
        p.click.findMany({
          where: { link: { userId }, ts: { gte: since } },
          select: { ts: true, earnings: true },
        }),
      );
      const buckets = new Map<string, { clicks: number; revenue: number }>();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * DAY_SECONDS * 1000);
        buckets.set(d.toISOString().slice(0, 10), { clicks: 0, revenue: 0 });
      }
      for (const c of clicks) {
        const key = c.ts.toISOString().slice(0, 10);
        const b = buckets.get(key);
        if (!b) continue;
        b.clicks += 1;
        b.revenue += c.earnings;
      }
      return Array.from(buckets.entries()).map(([date, v]) => ({
        date,
        clicks: v.clicks,
        revenue: Number(v.revenue.toFixed(2)),
      }));
    },
    [`analytics-timeseries-${userId}-${days}`],
    { revalidate: 300, tags: [`analytics-timeseries-${userId}-${days}`] },
  )();

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const days = Math.min(Math.max(Number(url.searchParams.get("days") ?? 30), 1), 365);
    const series = await getCachedSeries(user.id, days);
    return ok({ series });
  } catch (e) {
    return handleError(e);
  }
}
