import { unstable_cache } from "next/cache";
import { dbQuery } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";

const getCachedBrowsers = (userId: string) =>
  unstable_cache(
    async () => {
      const grouped = await dbQuery((p) =>
        p.click.groupBy({
          by: ["browser"],
          where: { link: { userId } },
          _count: { _all: true },
        }),
      );
      const total = grouped.reduce((a, b) => a + b._count._all, 0) || 1;
      return grouped
        .map((g) => ({
          name: g.browser,
          share: g._count._all / total,
          clicks: g._count._all,
        }))
        .sort((a, b) => b.clicks - a.clicks);
    },
    [`analytics-browsers-${userId}`],
    { revalidate: 300, tags: [`analytics-browsers-${userId}`] },
  )();

export async function GET() {
  try {
    const user = await requireUser();
    const browsers = await getCachedBrowsers(user.id);
    const total = browsers.reduce((a, b) => a + b.clicks, 0);
    return ok({ browsers, total });
  } catch (e) {
    return handleError(e);
  }
}
