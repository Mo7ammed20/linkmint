# AGENTS.md

## Project

Full-stack URL shortener & link monetization SaaS. Next.js 16 App Router frontend with a real Postgres backend (Prisma). Auth is hand-rolled (bcrypt + JWT in httpOnly cookie, session row in DB for revocation).

There is **no test framework**. Verification is `lint` → `typecheck` → `build`.

## Setup

`.env` is required (it's in `.gitignore`):

```
DATABASE_URL=postgresql://...        # Postgres URL (Neon, local, etc.)
AUTH_SECRET=...                      # 32+ byte secret. openssl rand -hex 32
NEXT_PUBLIC_APP_URL=http://localhost:3000   # used by email/OG; hard-coded fallback in app/layout.tsx
```

`npm install` runs `prisma generate` automatically via `postinstall`. After changing `prisma/schema.prisma`, run `npm run prisma:migrate`. To wipe and reseed dev data: `npm run prisma:reset` (drops, re-migrates, seeds).

Seed login: `admin@linkmint.io` / `password123` (admin), `alex@studio.dev` / `password123` (user). The first user to register through the API is auto-promoted to `ADMIN`; subsequent registrations are `USER`.

## Commands

```bash
npm run dev               # next dev --turbopack -H 0.0.0.0 -p 3000
npm run build             # next build (Turbopack)
npm run start             # serve production build
npm run lint              # eslint (Next + TS)
npm run typecheck         # tsc --noEmit
npm run prisma:migrate    # create/apply a migration
npm run prisma:reset      # drop + recreate + seed (destroys data)
npm run db:seed           # populate dev data only
npm run prisma:studio     # Prisma Studio UI
```

The dev script binds `0.0.0.0:3000` so phones/tablets on the same Wi-Fi can hit the LAN IP. `next.config.ts` whitelists `192.168.1.2` in `allowedDevOrigins` — without this, Next 16 blocks HMR / RSC requests from non-localhost hosts.

## Architecture

```
app/
  layout.tsx                  # root: theme bootstrap script, fonts, Toaster
  globals.css                 # Tailwind v4 entry, @theme tokens, keyframes
  (marketing)/                # public site — header/footer + aurora bg
    page.tsx                  # /
    pricing/  blog/  blog/[slug]/
  (auth)/                     # /login /register /forgot-password /reset-password
  (dashboard)/  layout.tsx    # user dashboard shell (sidebar, command palette, AdBlockDetector, StoreHydrator)
    dashboard/                # /dashboard, /dashboard/links, /dashboard/analytics, ...
  (admin)/      layout.tsx    # admin shell
    admin/                    # /admin, /admin/users, /admin/ads, /admin/blog, ...
  r/[code]/page.tsx           # ONLY async page; resolves shortCode via Prisma, renders <RedirectFlow />
  api/                        # 18 route handlers — see "API surface" below
prisma/
  schema.prisma               # 10 models, enum-like fields are String
  seed.ts                     # DB seeder (idempotent: clears + recreates)
  migrations/<ts>_init/       # the one migration; regenerate only on schema change
components/
  ui/                         # shadcn-style primitives (hand-rolled, NOT the CLI)
  motion/                     # framer-motion wrappers
  redirect/                   # 3-step × 30s redirect flow + not-found fallback
  store-hydrator.tsx          # mounted in (dashboard)/(admin) layouts; fetches store data
  theme-init.tsx              # applies resolved theme + matchMedia listener
  adblock-detector.tsx        # read-from-localStorage dismissal flag
lib/
  db.ts             # Prisma client singleton — NODE ONLY (no client components)
  auth.ts           # bcrypt + jose JWT; requireUser/requireAdmin throw AuthError
  api.ts            # ok/fail/handleError/readJson<T>(req, zod) — server helpers
  api-client.ts     # fetch wrapper with ApiError, credentials: "include"
  short-code.ts     # generateShortCode, isReservedCode, normalizeCustomAlias
  email.ts          # sendResetEmail — STUB (console.log in dev)
  seed.ts           # IN-MEMORY seed data for marketing SSR + store defaults (see below)
  utils.ts          # cn() + Intl formatters
stores/             # 6 zustand stores (see "Persistence" below)
```

### API surface (`app/api/.../route.ts`)

`auth/{login,register,logout,me,request-reset,reset-password}` · `links` (GET/POST) · `links/[id]` (GET/PATCH/DELETE) · `links/resolve/[code]` (public) · `analytics/{timeseries,countries,devices,browsers,referrers}` · `ads` + `ads/[id]` · `payouts` + `payouts/[id]` · `blog` + `blog/[id]` + `blog/slug/[slug]` · `users` + `users/[id]` + `users/me` · `notifications` + `notifications/[id]` · `audit` · `track` (public, hit from `/r/[code]`).

### Two `seed.ts` files — do not conflate

- `prisma/seed.ts` — the **DB seeder** (idempotent; wipes + recreates rows; run via `npm run db:seed` or `prisma:reset`).
- `lib/seed.ts` — **in-memory** fallback data, used by 8 files: `stores/platform-store.ts` (initial state), marketing pages (`blog/page.tsx`, `blog-post-client.tsx`, `blog-index-client.tsx`, `analytics-showcase.tsx`), and dashboard widgets (`overview.tsx`, `analytics-client.tsx`, `admin/admin-overview.tsx`). These give marketing pages stable SSR output and provide a placeholder before `<StoreHydrator />` fetches live data.

## Prisma conventions (non-obvious)

The schema deliberately uses `String` columns for everything enum-like, with **lowercase** values matching the original frontend shape:

| Field           | Type    | Values                                |
| --------------- | ------- | ------------------------------------- |
| `User.role`     | String  | `"user"`, `"admin"`                   |
| `User.plan`     | String  | `"free"`, `"pro"`, `"business"`, `"enterprise"` |
| `User.status`   | String  | `"active"`, `"suspended"`, `"pending"`|
| `User.country`  | String  | ISO-2 (`"US"`, `"GB"`, …)             |
| `Link.status`   | String  | `"active"`, `"paused"`, `"expired"`, `"disabled"` |
| `Ad.type`       | String  | `"banner"`, `"native"`, `"interstitial"`, `"popunder"`, `"push"`, `"mobile"` |
| `Ad.status`     | String  | `"active"`, `"paused"`, `"disabled"`  |
| `Payout.method` | String  | `"paypal"`, `"bank"`, `"crypto"`, `"stripe"` |
| `Payout.status` | String  | `"pending"`, `"processing"`, `"completed"`, `"failed"` |
| `BlogPost.status` | String | `"draft"`, `"published"`, `"scheduled"` |
| `Notification.type` | String | `"info"`, `"success"`, `"warning"`, `"error"` |

Naming: `Link.clicks` / `Link.earnings` (not `totalClicks`/`totalEarnings`); `User.avatar` (not `avatarUrl`). Match these in any new query or migration — components and `lib/auth.ts::toSessionUser` rely on them.

## Persistence

| Store             | Persist? | Hydrated by            | Notes                                    |
| ----------------- | -------- | ---------------------- | ---------------------------------------- |
| `auth-store`      | fetch-only | `hydrate()` → `/api/auth/me` | login/register must call `/api/auth/me` after to populate the real user (don't trust the response of the login endpoint alone) |
| `links-store`     | fetch-only | `hydrate()` → `/api/links`   | user-owned links                         |
| `platform-store`  | fetch-only | per-entity `fetch*`          | ads, payouts, blog, audit, users, notifications |
| `settings-store`  | `localStorage` (`linkmint.settings`) | —       | currency, language, timezone, notif prefs |
| `theme-store`     | `localStorage` (`linkmint.theme`)    | —       | mode: `light`/`dark`/`midnight`/`system` |
| `ui-store`        | `localStorage` (`linkmint.ui`)       | —       | command palette open, sidebar, adblock flag |

**Components read stores; they never trigger fetches.** Data fetching lives in `<StoreHydrator />` inside `(dashboard)/layout.tsx` and `(admin)/layout.tsx`.

**Direct `localStorage` access is allowed in only two places outside the stores:**
1. `app/layout.tsx` — the inline `themeScript` reads `linkmint.theme` before hydration to set `data-theme` and prevent FOUC. If you rename the key in `theme-store.ts`, update the script.
2. `components/adblock-detector.tsx` — dismissal flag `linkmint.adblock.dismissed`.

**Cookie:** `linkmint.session` is a JWT in an httpOnly cookie (`SameSite=Lax`, `Secure` only in production). The raw token is also stored in the `Session` table so it can be revoked on logout or password reset. `lib/auth.ts::getCurrentUser` decodes the JWT; the middleware (see below) only checks signature + `payload.role`.

## Auth model

- `lib/auth.ts::hashPassword` uses bcrypt (10 rounds). Sessions are JWTs (`jose`, HS256) signed with `AUTH_SECRET`; the raw token is also persisted in the `Session` table.
- `requireUser()` throws `AuthError(401)`, `requireAdmin()` throws `AuthError(403)`. Wrap handlers in `handleError()` from `lib/api.ts` to convert to `NextResponse`.
- `requestPasswordReset` writes a one-hour token to `PasswordResetToken`. `lib/email.ts::sendResetEmail` is a console-log stub — do not wire it to a real provider without asking.
- First user to hit `POST /api/auth/register` is auto-promoted to `ADMIN`.

## Middleware (deprecated — see "Next.js 16 deprecations" below)

`middleware.ts` runs on every request. It allows through: `/`, `/pricing`, `/blog`, `/blog/*`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/r/*`, `/api/auth/*`, `/api/links/resolve/*`, `/api/track`, `/api/blog/*`, and `_next`/`favicon`. Everything under `/dashboard/*` requires a valid `linkmint.session` JWT; `/admin/*` additionally requires `payload.role === "admin"` (non-admins are redirected to `/dashboard`). Unauthenticated requests to a protected path redirect to `/login?next=<path>`.

## Route groups — footgun

`(dashboard)` and `(admin)` are **Next.js route groups**: they group files under a shared `layout.tsx` but do **not** appear in the URL. `app/(dashboard)/dashboard/page.tsx` lives at `/dashboard`, not `/(dashboard)/dashboard`. **Never** add `app/(dashboard)/foo/page.tsx` — it would expose `/foo` with the dashboard chrome. Always add dashboard pages under `app/(dashboard)/dashboard/...` and admin pages under `app/(admin)/admin/...`.

## Page thin-wrapper pattern

Every `app/**/page.tsx` is a 5-line server component that imports a `*-client.tsx` (or section component) from `components/...`. The only `async` page is `app/r/[code]/page.tsx` (it awaits `params`). Put real UI in `components/<section>/<page>-client.tsx`; keep page files as server-component shells.

## Conventions

- **Default export** for `app/**/page.tsx` and `app/layout.tsx`. **Named exports** everywhere else — never `export default` in `components/`, `lib/`, or `stores/`.
- **No comments in code** unless the user asks.
- **No CSS-in-JS / CSS modules.** Tailwind v4 utilities only.
- **Class merging**: `cn()` from `lib/utils.ts` (clsx + tailwind-merge).
- **Charts**: `<ResponsiveContainer width="100%" height={fixed}>`.
- **Forms**: React Hook Form + Zod resolver. Never uncontrolled.
- **Date/number formatting**: `Intl` with explicit locale (`en-US`); use the helpers in `lib/utils.ts`.
- **Animations**: framer-motion wrappers in `components/motion/`. Reveal uses `whileInView` with `viewport={{ once: true }}` so they don't replay on scroll-back.
- **Tailwind v4 `@utility` gotcha**: utility names must be a single bare identifier — `@utility name::pseudo` and `@utility name:state` are rejected. Put pseudo-element rules in `@layer base` (see `.noise::after` in `app/globals.css`).
- **Tailwind v4 colors**: tokens are CSS variables on `:root[data-theme="..."]` and re-exposed via `@theme inline` in `app/globals.css`. Add a new color in both places.

## Themes

`light | dark | midnight | system` (default `system`). Stored in `useThemeStore`, applied as `data-theme` on `<html>`. `system` mode listens to `prefers-color-scheme` via `matchMedia` in `components/theme-init.tsx`. The inline `themeScript` in `app/layout.tsx` runs before React hydrates and sets `data-theme` directly to prevent FOUC.

## Things an agent should not do

- **No third-party auth provider** (Clerk, Auth0, NextAuth, Supabase Auth). Hand-rolled bcrypt + JWT is locked.
- **No payment processor.** Payouts are recorded only.
- **No test framework, Storybook, or extra tooling** without asking.
- **No `tailwind.config.ts`** — Tailwind v4 reads tokens from `app/globals.css`.
- **No `next/document` imports** — App Router only.
- **No `@utility name::pseudo` / `@utility name:state`** in `globals.css` — use `@layer base`.
- **No new routes under `app/(dashboard)/` or `app/(admin)/` outside their existing path subfolders** — the groups are layout-only.
- **No `localStorage` writes** outside the Zustand stores (the theme bootstrap script and adblock dismissal flag are the only exceptions, both listed above).
- **No Prisma from `"use client"` components.** `lib/db.ts` is Node-only — call it from route handlers and server components only.
- **No real email sender** in `lib/email.ts` without confirming the provider first — the stub is deliberate.

## Next.js 16 deprecations / breaking changes

- **`middleware.ts` is deprecated.** Next 16 wants `proxy.ts` (see [migration guide](https://nextjs.org/docs/messages/middleware-to-proxy)). Every `npm run dev` prints a warning until renamed.
- **Cross-origin dev requests are blocked by default.** Hitting the dev server from a phone on the LAN (e.g. `http://192.168.1.2:3000`) will fail unless the host is in `allowedDevOrigins` in `next.config.ts` (already configured for the common private ranges — adjust if your LAN uses something else).
- **`metadataBase: new URL("https://linkmint.local")` is hard-coded** in `app/layout.tsx`. Should be derived from `process.env.NEXT_PUBLIC_APP_URL` for production OG images to work.
- **Multiple lockfiles warning.** A `package-lock.json` exists at `C:\Users\Admin\package-lock.json` (one level above this repo) and confuses Turbopack. Either remove the parent lockfile or set `turbopack.root` in `next.config.ts` to silence it.

## Windows / PowerShell 5.1 quirks

This project is developed on Windows; the shell is PowerShell 5.1.

- **`curl` is `Invoke-WebRequest`**, not real curl. Use `curl.exe` for HTTP testing.
- **`&&` is not supported.** Chain with `; if ($?) { ... }` or use two separate calls.
- **`npm run dev` is a long-running process** and the shell tool has a 120s default timeout. Redirect to a log and start it in the background: `npm run dev 1>"$env:TEMP\nextdev.log" 2>&1`. The dev server's child Node process holds port 3000 even after the parent shell returns. To stop cleanly, kill by port: `Get-NetTCPConnection -State Listen -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`.
- **Windows Firewall blocks inbound TCP on Public network profiles.** If `Get-NetConnectionProfile` shows your Wi-Fi as `Public`, the dev server is unreachable from other devices. Fix by either (a) flipping the network to `Private` in Settings, or (b) running once as Administrator: `New-NetFirewallRule -DisplayName "Next.js Dev 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -Profile Any`.
- **`prisma migrate reset` requires an interactive confirmation** unless you pass `--force`. Use `npm run prisma:reset` (the script handles this) or call `prisma migrate reset --force` directly when scripting.
