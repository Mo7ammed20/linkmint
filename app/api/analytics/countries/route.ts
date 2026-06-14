import { unstable_cache } from "next/cache";
import { dbQuery } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";

const NAMES: Record<string, { name: string; flag: string }> = {
  US: { name: "United States", flag: "🇺🇸" },
  IN: { name: "India", flag: "🇮🇳" },
  GB: { name: "United Kingdom", flag: "🇬🇧" },
  DE: { name: "Germany", flag: "🇩🇪" },
  BR: { name: "Brazil", flag: "🇧🇷" },
  FR: { name: "France", flag: "🇫🇷" },
  JP: { name: "Japan", flag: "🇯🇵" },
  CA: { name: "Canada", flag: "🇨🇦" },
  AU: { name: "Australia", flag: "🇦🇺" },
  ES: { name: "Spain", flag: "🇪🇸" },
};

const getCachedCountries = (userId: string) =>
  unstable_cache(
    async () => {
      const grouped = await dbQuery((p) =>
        p.click.groupBy({
          by: ["country"],
          where: { link: { userId } },
          _count: { _all: true },
        }),
      );
      const total = grouped.reduce((a, b) => a + b._count._all, 0) || 1;
      return grouped
        .map((g) => ({
          code: g.country,
          name: NAMES[g.country]?.name ?? g.country,
          flag: NAMES[g.country]?.flag ?? "🏳️",
          clicks: g._count._all,
        }))
        .sort((a, b) => b.clicks - a.clicks);
    },
    [`analytics-countries-${userId}`],
    { revalidate: 300, tags: [`analytics-countries-${userId}`] },
  )();

export async function GET() {
  try {
    const user = await requireUser();
    const countries = await getCachedCountries(user.id);
    const total = countries.reduce((a, b) => a + b.clicks, 0);
    return ok({ countries, total });
  } catch (e) {
    return handleError(e);
  }
}
