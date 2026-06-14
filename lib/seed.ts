import { nanoid } from "nanoid";

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

function daysAgo(d: number): number {
  return NOW - d * DAY;
}

function createRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = createRng(42);

export interface SeedUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "user" | "admin";
  plan: "free" | "pro" | "business" | "enterprise";
  createdAt: number;
  country: string;
  status: "active" | "suspended" | "pending";
  totalEarnings: number;
  totalClicks: number;
  totalLinks: number;
}

export interface SeedLink {
  id: string;
  userId: string;
  shortCode: string;
  destination: string;
  title?: string;
  description?: string;
  tags: string[];
  clicks: number;
  earnings: number;
  createdAt: number;
  lastClickedAt?: number;
  expiresAt?: number;
  status: "active" | "paused" | "expired" | "disabled";
  password?: boolean;
  customAlias?: boolean;
}

export interface SeedBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover?: string;
  category: string;
  tags: string[];
  authorId: string;
  status: "draft" | "published" | "scheduled";
  publishedAt?: number;
  scheduledAt?: number;
  readTime: number;
  views: number;
}

export interface SeedAd {
  id: string;
  name: string;
  type: "banner" | "native" | "interstitial" | "popunder" | "push" | "mobile";
  status: "active" | "paused" | "disabled";
  cpm: number;
  ctr: number;
  impressions: number;
  clicks: number;
  revenue: number;
  width?: number;
  height?: number;
  body: string;
  imageUrl?: string;
  cta: string;
  url: string;
  createdAt: number;
}

export interface SeedPayout {
  id: string;
  userId: string;
  amount: number;
  method: "paypal" | "bank" | "crypto" | "stripe";
  status: "pending" | "processing" | "completed" | "failed";
  requestedAt: number;
  completedAt?: number;
  reference?: string;
}

export interface SeedAuditEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  target: string;
  ip: string;
  createdAt: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface SeedNotification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
}

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
];

const DEVICES = [
  { name: "Desktop", share: 0.42 },
  { name: "Mobile", share: 0.48 },
  { name: "Tablet", share: 0.08 },
  { name: "Smart TV", share: 0.02 },
];

const BROWSERS = [
  { name: "Chrome", share: 0.62 },
  { name: "Safari", share: 0.19 },
  { name: "Edge", share: 0.08 },
  { name: "Firefox", share: 0.06 },
  { name: "Other", share: 0.05 },
];

const REFERRERS = [
  { name: "Direct", share: 0.32 },
  { name: "Google", share: 0.28 },
  { name: "Twitter / X", share: 0.14 },
  { name: "Facebook", share: 0.1 },
  { name: "LinkedIn", share: 0.06 },
  { name: "Reddit", share: 0.05 },
  { name: "Other", share: 0.05 },
];

export function seedUsers(): SeedUser[] {
  return [
    { id: "u_admin", email: "admin@linkmint.io", name: "Sienna Park", role: "admin", plan: "enterprise", createdAt: daysAgo(420), country: "US", status: "active", totalEarnings: 0, totalClicks: 0, totalLinks: 0 },
    { id: "u_1", email: "alex@studio.dev", name: "Alex Morgan", role: "user", plan: "pro", createdAt: daysAgo(180), country: "US", status: "active", totalEarnings: 4821.42, totalClicks: 184_213, totalLinks: 64 },
    { id: "u_2", email: "lina@indie.co", name: "Lina Chen", role: "user", plan: "business", createdAt: daysAgo(96), country: "GB", status: "active", totalEarnings: 12_842.18, totalClicks: 612_904, totalLinks: 142 },
    { id: "u_3", email: "marcus@build.io", name: "Marcus Reyes", role: "user", plan: "free", createdAt: daysAgo(28), country: "DE", status: "active", totalEarnings: 184.22, totalClicks: 8_412, totalLinks: 12 },
    { id: "u_4", email: "noor@launch.app", name: "Noor Haddad", role: "user", plan: "pro", createdAt: daysAgo(60), country: "AE", status: "pending", totalEarnings: 612.04, totalClicks: 24_201, totalLinks: 22 },
    { id: "u_5", email: "spam@botmail.net", name: "Unknown User", role: "user", plan: "free", createdAt: daysAgo(2), country: "??", status: "suspended", totalEarnings: 0, totalClicks: 92, totalLinks: 4 },
  ];
}

export function seedCurrentUser(): SeedUser {
  return {
    id: "u_1",
    email: "alex@studio.dev",
    name: "Alex Morgan",
    role: "user",
    plan: "pro",
    createdAt: daysAgo(180),
    country: "US",
    status: "active",
    totalEarnings: 4821.42,
    totalClicks: 184_213,
    totalLinks: 64,
  };
}

const LINK_DESTINATIONS: Array<Pick<SeedLink, "destination" | "title" | "tags" | "status">> = [
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

const shortPool = [
  "launch", "ship", "guide", "earn", "promo", "spring", "dev", "vault", "summer",
  "links", "alpha", "docs", "boost", "secure", "type",
];

export function seedLinks(): SeedLink[] {
  return LINK_DESTINATIONS.map((entry, i) => {
    const clicks = Math.round(40_000 / (i + 1) + rng() * 4_000);
    const cpm = 1.8 + rng() * 3.5;
    return {
      id: `link_${i + 1}`,
      userId: "u_1",
      shortCode: shortPool[i] ?? nanoid(7),
      destination: entry.destination,
      title: entry.title,
      tags: entry.tags,
      clicks,
      earnings: Number(((clicks / 1000) * cpm).toFixed(2)),
      createdAt: daysAgo(20 + i * 3),
      lastClickedAt: daysAgo(rng() * 0.4),
      status: entry.status,
      customAlias: i % 4 === 0,
      password: i === 9,
    };
  });
}

export function seedTimeSeries(days = 30): Array<{ date: string; clicks: number; revenue: number }> {
  const out: Array<{ date: string; clicks: number; revenue: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(daysAgo(i));
    const trend = (days - i) / days;
    const seasonal = Math.sin((i / 7) * Math.PI * 2) * 0.25 + 1;
    const noise = 0.85 + rng() * 0.3;
    const clicks = Math.round(2200 * trend * seasonal * noise);
    const cpm = 2.4 + rng() * 1.2;
    out.push({
      date: date.toISOString().slice(0, 10),
      clicks,
      revenue: Number(((clicks / 1000) * cpm).toFixed(2)),
    });
  }
  return out;
}

export function seedCountries() {
  return COUNTRIES.map((c, i) => ({
    code: c.code,
    name: c.name,
    flag: c.flag,
    clicks: Math.round(40_000 * (1 - i * 0.08) * (0.8 + rng() * 0.4)),
  }));
}

export function seedDevices() {
  return DEVICES.map((d) => ({ name: d.name, share: d.share, clicks: Math.round(184_213 * d.share) }));
}

export function seedBrowsers() {
  return BROWSERS.map((b) => ({ name: b.name, share: b.share, clicks: Math.round(184_213 * b.share) }));
}

export function seedReferrers() {
  return REFERRERS.map((r) => ({ name: r.name, share: r.share, clicks: Math.round(184_213 * r.share) }));
}

export function seedAds(): SeedAd[] {
  return [
    { id: "ad_1", name: "Hero Banner — Launch", type: "banner", status: "active", cpm: 3.4, ctr: 0.022, impressions: 142_842, clicks: 3_142, revenue: 485.66, width: 728, height: 90, body: "Build, ship, and monetize — all in one place.", cta: "Start free", url: "https://example.com/hero", createdAt: daysAgo(40) },
    { id: "ad_2", name: "Native — Sidebar", type: "native", status: "active", cpm: 2.8, ctr: 0.018, impressions: 92_104, clicks: 1_658, revenue: 257.89, body: "Turn your audience into revenue with smart redirects.", cta: "Learn more", url: "https://example.com/native", createdAt: daysAgo(30) },
    { id: "ad_3", name: "Interstitial — Mid funnel", type: "interstitial", status: "active", cpm: 5.6, ctr: 0.041, impressions: 38_204, clicks: 1_566, revenue: 213.94, body: "Unlock 3x higher CPMs with interstitial placements.", cta: "Upgrade", url: "https://example.com/interstitial", createdAt: daysAgo(18) },
    { id: "ad_4", name: "Popunder — Global", type: "popunder", status: "paused", cpm: 1.2, ctr: 0.011, impressions: 412_882, clicks: 4_541, revenue: 495.46, body: "Background monetization that doesn't disrupt the flow.", cta: "Get started", url: "https://example.com/popunder", createdAt: daysAgo(60) },
    { id: "ad_5", name: "Push — Re-engage", type: "push", status: "active", cpm: 0.6, ctr: 0.082, impressions: 88_122, clicks: 7_226, revenue: 52.87, body: "Re-engage visitors with timely push notifications.", cta: "Subscribe", url: "https://example.com/push", createdAt: daysAgo(12) },
    { id: "ad_6", name: "Mobile — App install", type: "mobile", status: "active", cpm: 4.2, ctr: 0.052, impressions: 24_204, clicks: 1_258, revenue: 101.66, body: "Drive mobile installs with precision targeting.", cta: "Install", url: "https://example.com/mobile", createdAt: daysAgo(8) },
  ];
}

export function seedPayouts(): SeedPayout[] {
  return [
    { id: "po_1", userId: "u_1", amount: 1_240.0, method: "paypal", status: "completed", requestedAt: daysAgo(28), completedAt: daysAgo(26), reference: "PP-3A91-22F1" },
    { id: "po_2", userId: "u_1", amount: 980.5, method: "stripe", status: "completed", requestedAt: daysAgo(14), completedAt: daysAgo(13), reference: "TR-91FA-AC12" },
    { id: "po_3", userId: "u_1", amount: 1_502.75, method: "crypto", status: "processing", requestedAt: daysAgo(3), reference: "CR-1F2C-99AA" },
    { id: "po_4", userId: "u_1", amount: 240.0, method: "paypal", status: "pending", requestedAt: daysAgo(1) },
  ];
}

export function seedBlogPosts(): SeedBlogPost[] {
  return [
    { id: "p_1", slug: "how-we-built-linkmint", title: "How we built Linkmint: lessons from a modern link shortener", excerpt: "The architecture, tradeoffs, and motion-design philosophy behind a SaaS that feels both fast and luxurious.", content: "We wanted a tool that felt expensive from the very first click. That meant rethinking how a shortener should *feel* — from animated redirects to the dashboard itself.\n\nIn this article we cover the stack, the redirect flow, and the small details that compound into a premium experience.", category: "Engineering", tags: ["architecture", "next-js", "motion"], authorId: "u_admin", status: "published", publishedAt: daysAgo(7), readTime: 8, views: 12_482 },
    { id: "p_2", slug: "monetization-2026", title: "Link monetization in 2026: CPMs, funnels, and trust", excerpt: "Where ad dollars are moving and how creators are capturing more of them.", content: "Monetization is shifting. The platforms that thrive are the ones that respect the user while still paying creators well.", category: "Monetization", tags: ["cpm", "earnings", "trends"], authorId: "u_admin", status: "published", publishedAt: daysAgo(20), readTime: 6, views: 8_204 },
    { id: "p_3", slug: "designing-aurora", title: "Designing an aurora background that doesn't kill performance", excerpt: "A practical guide to layered mesh gradients, blur, and motion budgets.", content: "Aurora backgrounds are everywhere — and most of them tank your Lighthouse score.", category: "Design", tags: ["motion", "css", "performance"], authorId: "u_admin", status: "published", publishedAt: daysAgo(35), readTime: 5, views: 5_811 },
    { id: "p_4", slug: "adblock-detection", title: "Ad-block detection without the dark patterns", excerpt: "We explain why transparent messaging converts better than stealth workarounds.", content: "Most ad-block detection libraries feel adversarial.", category: "Product", tags: ["ads", "ethics", "ux"], authorId: "u_admin", status: "draft", readTime: 4, views: 0 },
  ];
}

export function seedAuditLog(): SeedAuditEntry[] {
  return [
    { id: "al_1", actorId: "u_1", actorName: "Alex Morgan", action: "link.create", target: "link_8", ip: "73.142.21.88", createdAt: daysAgo(0.05) },
    { id: "al_2", actorId: "u_admin", actorName: "Sienna Park", action: "ad.update", target: "ad_3", ip: "104.18.42.6", createdAt: daysAgo(0.2) },
    { id: "al_3", actorId: "u_1", actorName: "Alex Morgan", action: "payout.request", target: "po_4", ip: "73.142.21.88", createdAt: daysAgo(1) },
    { id: "al_4", actorId: "u_2", actorName: "Lina Chen", action: "auth.login", target: "session", ip: "88.211.4.10", createdAt: daysAgo(1.4) },
    { id: "al_5", actorId: "u_admin", actorName: "Sienna Park", action: "user.suspend", target: "u_5", ip: "104.18.42.6", createdAt: daysAgo(2) },
  ];
}

export function seedNotifications(): SeedNotification[] {
  return [
    { id: "n_1", type: "success", title: "Payout completed", body: "$980.50 sent to your Stripe account.", read: false, createdAt: daysAgo(0.1) },
    { id: "n_2", type: "info", title: "New milestone", body: "You crossed 180,000 total clicks this month.", read: false, createdAt: daysAgo(0.4) },
    { id: "n_3", type: "warning", title: "Link expires soon", body: "Linear's product method expires in 3 days.", read: true, createdAt: daysAgo(2) },
  ];
}
