import { customAlphabet } from "nanoid";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const generate = customAlphabet(alphabet, 7);

const RESERVED = new Set([
  "api",
  "admin",
  "dashboard",
  "login",
  "register",
  "logout",
  "settings",
  "r",
  "blog",
  "pricing",
  "about",
  "help",
  "support",
  "terms",
  "privacy",
  "auth",
  "billing",
  "earnings",
  "analytics",
  "links",
  "users",
  "ads",
  "withdrawals",
  "audit",
  "home",
  "app",
  "docs",
  "static",
  "public",
  "assets",
]);

export function generateShortCode(length = 7): string {
  return generate(length);
}

export function isReservedCode(code: string): boolean {
  return RESERVED.has(code.toLowerCase());
}

export function normalizeCustomAlias(input: string): string {
  return input.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_]/g, "");
}

export function buildShortUrl(origin: string, code: string): string {
  return `${origin.replace(/\/$/, "")}/r/${code}`;
}
