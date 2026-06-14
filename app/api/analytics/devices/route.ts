import { unstable_cache } from "next/cache";
import { dbQuery } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";

const getCachedDevices = (userId: string) =>
  unstable_cache(
    async () => {
      const grouped = await dbQuery((p) =>
        p.click.groupBy({
          by: ["device"],
          where: { link: { userId } },
          _count: { _all: true },
        }),
      );
      const total = grouped.reduce((a, b) => a + b._count._all, 0) || 1;
      return grouped
        .map((g) => ({
          name: g.device,
          share: g._count._all / total,
          clicks: g._count._all,
        }))
        .sort((a, b) => b.clicks - a.clicks);
    },
    [`analytics-devices-${userId}`],
    { revalidate: 300, tags: [`analytics-devices-${userId}`] },
  )();

export async function GET() {
  try {
    const user = await requireUser();
    const devices = await getCachedDevices(user.id);
    const total = devices.reduce((a, b) => a + b.clicks, 0);
    return ok({ devices, total });
  } catch (e) {
    return handleError(e);
  }
}
