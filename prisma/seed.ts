import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (d: number) => new Date(NOW - d * DAY);

async function main() {
  console.info("[seed] resetting database");
  await db.notification.deleteMany();
  await db.auditEntry.deleteMany();
  await db.click.deleteMany();
  await db.payout.deleteMany();
  await db.blogPost.deleteMany();
  await db.link.deleteMany();
  await db.session.deleteMany();
  await db.passwordResetToken.deleteMany();
  await db.ad.deleteMany();
  await db.user.deleteMany();

  console.info("[seed] creating users");
  const passwordHash = await bcrypt.hash("password123", 10);
  const [admin, alex, lina, _marcus, _noor, spam] = await Promise.all([
    db.user.create({
      data: {
        email: "admin@linkmint.io",
        passwordHash,
        name: "Sienna Park",
        role: "admin",
        plan: "enterprise",
        country: "US",
        status: "active",
        createdAt: daysAgo(420),
      },
    }),
    db.user.create({
      data: {
        email: "alex@studio.dev",
        passwordHash,
        name: "Alex Morgan",
        role: "user",
        plan: "pro",
        country: "US",
        status: "active",
        createdAt: daysAgo(180),
      },
    }),
    db.user.create({
      data: {
        email: "lina@indie.co",
        passwordHash,
        name: "Lina Chen",
        role: "user",
        plan: "business",
        country: "GB",
        status: "active",
        createdAt: daysAgo(96),
      },
    }),
    db.user.create({
      data: {
        email: "marcus@build.io",
        passwordHash,
        name: "Marcus Reyes",
        role: "user",
        plan: "free",
        country: "DE",
        status: "active",
        createdAt: daysAgo(28),
      },
    }),
    db.user.create({
      data: {
        email: "noor@launch.app",
        passwordHash,
        name: "Noor Haddad",
        role: "user",
        plan: "pro",
        country: "AE",
        status: "pending",
        createdAt: daysAgo(60),
      },
    }),
    db.user.create({
      data: {
        email: "spam@botmail.net",
        passwordHash,
        name: "Unknown User",
        role: "user",
        plan: "free",
        country: "??",
        status: "suspended",
        createdAt: daysAgo(2),
      },
    }),
  ]);

  console.info("[seed] creating links");
  const linkTemplates: Array<{ destination: string; title: string; tags: string[]; status: "active" | "paused" }> = [
    { destination: "https://stripe.com/docs/payments", title: "Stripe Payments — Quickstart", tags: ["docs", "engineering"], status: "active" },
    { destination: "https://vercel.com/new", title: "Deploy your next project", tags: ["launch", "devops"], status: "active" },
    { destination: "https://linear.app/method", title: "Linear's product method", tags: ["product"], status: "active" },
    { destination: "https://dub.co/blog/how-we-built-our-link-shortener", title: "How we built a link shortener", tags: ["blog", "engineering"], status: "active" },
    { destination: "https://www.framer.com/motion/", title: "Framer Motion — Production-ready animations", tags: ["design", "engineering"], status: "active" },
    { destination: "https://github.com/vercel/next.js/discussions", title: "Next.js community", tags: ["open-source"], status: "paused" },
    { destination: "https://raycast.com/store", title: "Raycast Store — power user tools", tags: ["productivity"], status: "active" },
    { destination: "https://www.notion.so/product/ai", title: "Notion AI", tags: ["ai", "productivity"], status: "active" },
    { destination: "https://clerk.com/docs", title: "Clerk — Auth for the modern web", tags: ["auth", "engineering"], status: "active" },
    { destination: "https://www.figma.com/community", title: "Figma community files", tags: ["design"], status: "active" },
    { destination: "https://tailwindcss.com/docs/installation", title: "Install Tailwind CSS", tags: ["design", "docs"], status: "active" },
    { destination: "https://www.behance.net/galleries", title: "Behance — Discover creative work", tags: ["design"], status: "active" },
    { destination: "https://www.producthunt.com", title: "Product Hunt — Discover new products", tags: ["launch"], status: "active" },
    { destination: "https://mongodb.com/cloud/atlas", title: "MongoDB Atlas", tags: ["data", "engineering"], status: "active" },
    { destination: "https://www.typescriptlang.org/docs", title: "TypeScript docs", tags: ["engineering", "docs"], status: "active" },
  ];
  const shortPool = ["launch","ship","guide","earn","promo","spring","dev","vault","summer","links","alpha","docs","boost","secure","type"];

  const links = await Promise.all(
    linkTemplates.map((t, i) => {
      const clicks = Math.round(40_000 / (i + 1) + Math.random() * 4_000);
      const cpm = 1.8 + Math.random() * 3.5;
      const earnings = Number(((clicks / 1000) * cpm).toFixed(2));
      return db.link.create({
        data: {
          userId: alex.id,
          shortCode: shortPool[i] ?? `c${i}`,
          destination: t.destination,
          title: t.title,
          tags: t.tags,
          status: t.status,
          customAlias: i % 4 === 0,
          clicks,
          earnings,
          createdAt: daysAgo(20 + i * 3),
          lastClickedAt: daysAgo(Math.random() * 0.4),
        },
      });
    }),
  );

  await db.user.update({
    where: { id: alex.id },
    data: {
      totalLinks: links.length,
      totalClicks: links.reduce((a, l) => a + l.clicks, 0),
      totalEarnings: links.reduce((a, l) => a + l.earnings, 0),
    },
  });

  console.info("[seed] creating ads");
  await db.ad.createMany({
    data: [
      { name: "Hero Banner — Launch", type: "banner", status: "active", cpm: 3.4, ctr: 0.022, impressions: 142_842, clicks: 3_142, revenue: 485.66, width: 728, height: 90, body: "Build, ship, and monetize — all in one place.", cta: "Start free", url: "https://example.com/hero", createdAt: daysAgo(40) },
      { name: "Native — Sidebar", type: "native", status: "active", cpm: 2.8, ctr: 0.018, impressions: 92_104, clicks: 1_658, revenue: 257.89, body: "Turn your audience into revenue with smart redirects.", cta: "Learn more", url: "https://example.com/native", createdAt: daysAgo(30) },
      { name: "Interstitial — Mid funnel", type: "interstitial", status: "active", cpm: 5.6, ctr: 0.041, impressions: 38_204, clicks: 1_566, revenue: 213.94, body: "Unlock 3x higher CPMs with interstitial placements.", cta: "Upgrade", url: "https://example.com/interstitial", createdAt: daysAgo(18) },
      { name: "Popunder — Global", type: "popunder", status: "paused", cpm: 1.2, ctr: 0.011, impressions: 412_882, clicks: 4_541, revenue: 495.46, body: "Background monetization that doesn't disrupt the flow.", cta: "Get started", url: "https://example.com/popunder", createdAt: daysAgo(60) },
      { name: "Push — Re-engage", type: "push", status: "active", cpm: 0.6, ctr: 0.082, impressions: 88_122, clicks: 7_226, revenue: 52.87, body: "Re-engage visitors with timely push notifications.", cta: "Subscribe", url: "https://example.com/push", createdAt: daysAgo(12) },
      { name: "Mobile — App install", type: "mobile", status: "active", cpm: 4.2, ctr: 0.052, impressions: 24_204, clicks: 1_258, revenue: 101.66, body: "Drive mobile installs with precision targeting.", cta: "Install", url: "https://example.com/mobile", createdAt: daysAgo(8) },
    ],
  });

  console.info("[seed] creating payouts");
  await db.payout.createMany({
    data: [
      { userId: alex.id, amount: 1240, method: "paypal", status: "completed", requestedAt: daysAgo(28), completedAt: daysAgo(26), reference: "PP-3A91-22F1" },
      { userId: alex.id, amount: 980.5, method: "stripe", status: "completed", requestedAt: daysAgo(14), completedAt: daysAgo(13), reference: "TR-91FA-AC12" },
      { userId: alex.id, amount: 1502.75, method: "crypto", status: "processing", requestedAt: daysAgo(3), reference: "CR-1F2C-99AA" },
      { userId: alex.id, amount: 240, method: "paypal", status: "pending", requestedAt: daysAgo(1) },
    ],
  });

  console.info("[seed] creating blog posts");
  await db.blogPost.createMany({
    data: [
      { slug: "how-we-built-linkmint", title: "How we built Linkmint: lessons from a modern link shortener", excerpt: "The architecture, tradeoffs, and motion-design philosophy behind a SaaS that feels both fast and luxurious.", content: "We wanted a tool that felt expensive from the very first click.", category: "Engineering", tags: ["architecture", "next-js", "motion"], authorId: admin.id, status: "published", publishedAt: daysAgo(7), readTime: 8, views: 12_482 },
      { slug: "monetization-2026", title: "Link monetization in 2026: CPMs, funnels, and trust", excerpt: "Where ad dollars are moving and how creators are capturing more of them.", content: "Monetization is shifting.", category: "Monetization", tags: ["cpm", "earnings", "trends"], authorId: admin.id, status: "published", publishedAt: daysAgo(20), readTime: 6, views: 8_204 },
      { slug: "designing-aurora", title: "Designing an aurora background that doesn't kill performance", excerpt: "A practical guide to layered mesh gradients, blur, and motion budgets.", content: "Aurora backgrounds are everywhere.", category: "Design", tags: ["motion", "css", "performance"], authorId: admin.id, status: "published", publishedAt: daysAgo(35), readTime: 5, views: 5_811 },
      { slug: "adblock-detection", title: "Ad-block detection without the dark patterns", excerpt: "We explain why transparent messaging converts better than stealth workarounds.", content: "Most ad-block detection libraries feel adversarial.", category: "Product", tags: ["ads", "ethics", "ux"], authorId: admin.id, status: "draft", readTime: 4, views: 0 },
    ],
  });

  console.info("[seed] creating audit log");
  await db.auditEntry.createMany({
    data: [
      { actorId: alex.id, actorName: alex.name, action: "link.create", target: links[7].id, ip: "73.142.21.88", createdAt: daysAgo(0.05) },
      { actorId: admin.id, actorName: admin.name, action: "ad.update", target: "ad_3", ip: "104.18.42.6", createdAt: daysAgo(0.2) },
      { actorId: alex.id, actorName: alex.name, action: "payout.request", target: "po_4", ip: "73.142.21.88", createdAt: daysAgo(1) },
      { actorId: lina.id, actorName: lina.name, action: "auth.login", target: "session", ip: "88.211.4.10", createdAt: daysAgo(1.4) },
      { actorId: admin.id, actorName: admin.name, action: "user.suspend", target: spam.id, ip: "104.18.42.6", createdAt: daysAgo(2) },
    ],
  });

  console.info("[seed] creating notifications");
  await db.notification.createMany({
    data: [
      { userId: alex.id, type: "success", title: "Payout completed", body: "$980.50 sent to your Stripe account.", read: false, createdAt: daysAgo(0.1) },
      { userId: alex.id, type: "info", title: "New milestone", body: "You crossed 180,000 total clicks this month.", read: false, createdAt: daysAgo(0.4) },
      { userId: alex.id, type: "warning", title: "Link expires soon", body: "Linear's product method expires in 3 days.", read: true, createdAt: daysAgo(2) },
    ],
  });

  console.info("[seed] creating sample clicks");
  const countries = ["US","IN","GB","DE","BR","FR","JP","CA","AU","ES"];
  const devices = ["Desktop","Mobile","Tablet","Smart TV"];
  const browsers = ["Chrome","Safari","Edge","Firefox"];
  const referrers = ["Direct","Google","Twitter / X","Facebook","LinkedIn","Reddit"];
  const clicksData: { linkId: string; country: string; device: string; browser: string; referrer: string; ipHash: string; earnings: number; ts: Date }[] = [];
  for (let d = 0; d < 30; d++) {
    const date = daysAgo(d);
    for (let i = 0; i < 60; i++) {
      const link = links[Math.floor(Math.random() * links.length)];
      clicksData.push({
        linkId: link.id,
        country: countries[Math.floor(Math.random() * countries.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        referrer: referrers[Math.floor(Math.random() * referrers.length)],
        ipHash: "anon",
        earnings: 0.002 + Math.random() * 0.006,
        ts: new Date(date.getTime() + Math.random() * DAY),
      });
    }
  }
  await db.click.createMany({ data: clicksData });

  console.info("[seed] done.");
  console.info(`  Login: admin@linkmint.io / password123   (role=ADMIN)`);
  console.info(`  Login: alex@studio.dev  / password123   (role=USER)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
