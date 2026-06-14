import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "linkmint.session";

const PUBLIC_PATHS = ["/", "/pricing", "/blog", "/login", "/register", "/forgot-password", "/reset-password"];
const PUBLIC_PREFIXES = ["/r/", "/api/auth/", "/api/links/resolve/", "/api/track", "/api/blog/", "/_next", "/favicon"];

function secret(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (!raw && process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET is required in production. Set it in Vercel env vars or .env (generate with: openssl rand -hex 32).",
    );
  }
  return new TextEncoder().encode(raw ?? "dev-only-insecure-secret");
}

async function readRole(token: string): Promise<{ ok: true; role: string | null } | { ok: false }> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return { ok: true, role: typeof payload.role === "string" ? payload.role : null };
  } catch {
    return { ok: false };
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) ||
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/blog/");

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  let isAuthenticated = false;
  let role: string | null = null;
  if (token) {
    const decoded = await readRole(token);
    isAuthenticated = decoded.ok;
    role = decoded.ok ? decoded.role : null;
  }

  if (isPublic) {
    return withAuthHeaders(NextResponse.next(), isAuthenticated, role);
  }

  const protectedPrefixes = ["/dashboard", "/admin"];
  const needsAuth = protectedPrefixes.some((p) => pathname.startsWith(p));
  const needsAdmin = pathname.startsWith("/admin");
  if (!needsAuth) return withAuthHeaders(NextResponse.next(), isAuthenticated, role);

  if (!isAuthenticated) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return withAuthHeaders(NextResponse.redirect(url), false, null);
  }

  if (needsAdmin && role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return withAuthHeaders(NextResponse.redirect(url), true, role);
  }

  return withAuthHeaders(NextResponse.next(), isAuthenticated, role);
}

function withAuthHeaders(res: NextResponse, authenticated: boolean, role: string | null): NextResponse {
  res.headers.set("x-authenticated", authenticated ? "true" : "false");
  if (role) res.headers.set("x-user-role", role);
  res.headers.set("Connection", "keep-alive");
  res.headers.set("Keep-Alive", "timeout=30, max=100");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
