import { unstable_cache } from "next/cache";
import { dbQuery } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";

const getCachedReferrers = (userId: string) =>
  unstable_cache(
    async () => {
      const grouped = await dbQuery((p) =>
        p.click.groupBy({
          by: ["referrer"],
          where: { link: { userId } },
          _count: { _all: true },
        }),
      );
      const total = grouped.reduce((a, b) => a + b._count._all, 0) || 1;
      return grouped
        .map((g) => ({
          name: g.referrer,
          share: g._count._all / total,
          clicks: g._count._all,
        }))
        .sort((a, b) => b.clicks - a.clicks);
    },
    [`analytics-referrers-${userId}`],
    { revalidate: 300, tags: [`analytics-referrers-${userId}`] },
  )();

export async function GET() {
  try {
    const user = await requireUser();
    const referrers = await getCachedReferrers(user.id);
    const total = referrers.reduce((a, b) => a + b.clicks, 0);
    return ok({ referrers, total });
  } catch (e) {
    return handleError(e);
  }
}
