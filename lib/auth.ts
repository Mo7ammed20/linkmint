import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";

const SESSION_COOKIE = "linkmint.session";
const SESSION_DAYS = 30;
const SESSION_SECONDS = SESSION_DAYS * 24 * 60 * 60;

export type UserRole = "user" | "admin";
export type UserPlan = "free" | "pro" | "business" | "enterprise";
export type UserStatus = "active" | "suspended" | "pending";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  plan: UserPlan;
  country: string;
  status: UserStatus;
  totalEarnings: number;
  totalClicks: number;
  totalLinks: number;
  createdAt: number;
}

function secret(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (!raw && process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET environment variable is required in production. " +
        "Set it in Vercel → Project Settings → Environment Variables, " +
        "or generate one locally with: openssl rand -hex 32",
    );
  }
  return new TextEncoder().encode(raw ?? "dev-only-insecure-secret");
}

export function isAuthSecretConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(userId: string, role: UserRole): Promise<string> {
  const token = await new SignJWT({ uid: userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(secret());
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000);
  await db.session.create({ data: { userId, token, expiresAt } }).catch(() => undefined);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return token;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const t = jar.get(SESSION_COOKIE)?.value;
  if (t) {
    await db.session.deleteMany({ where: { token: t } });
  }
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const t = jar.get(SESSION_COOKIE)?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, secret());
    const uid = typeof payload.uid === "string" ? payload.uid : null;
    if (!uid) return null;

    const session = await db.session.findUnique({ where: { token: t } });
    if (!session || session.expiresAt.getTime() < Date.now()) {
      if (session) await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
      jar.delete(SESSION_COOKIE);
      return null;
    }

    const user = await db.user.findUnique({ where: { id: uid } });
    if (!user) return null;
    return toSessionUser(user);
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const t = jar.get(SESSION_COOKIE)?.value;
  if (!t) return false;
  try {
    const { payload } = await jwtVerify(t, secret());
    return typeof payload.uid === "string" && Boolean(payload.uid);
  } catch {
    return false;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError("Unauthorized", 401);
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new AuthError("Forbidden", 403);
  }
  return user;
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 24);
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function toSessionUser(u: {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
  plan: string;
  country: string;
  status: string;
  totalEarnings: number;
  totalClicks: number;
  totalLinks: number;
  createdAt: Date;
}): SessionUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    avatar: u.avatar,
    role: u.role as UserRole,
    plan: u.plan as UserPlan,
    country: u.country,
    status: u.status as UserStatus,
    totalEarnings: u.totalEarnings,
    totalClicks: u.totalClicks,
    totalLinks: u.totalLinks,
    createdAt: u.createdAt.getTime(),
  };
}
