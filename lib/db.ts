import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

const RETRY_ERROR_CODES = new Set(["E57P01", "P1001", "P1002", "P1008", "P1017", "P2024"]);
const RETRY_ERROR_PATTERNS = [
  "terminating connection",
  "connection refused",
  "connection reset",
  "connection timed out",
  "server closed the connection",
  "broken pipe",
];

export async function dbQuery<T>(
  operation: (client: PrismaClient) => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation(db);
    } catch (error: unknown) {
      lastError = error;
      if (!isRetryable(error) || attempt >= maxRetries) {
        throw error;
      }
      const backoff = Math.min(1000 * 2 ** (attempt - 1), 5000);
      console.warn(
        `[Prisma] Retryable error on attempt ${attempt}/${maxRetries}, backing off ${backoff}ms:`,
        errorMessage(error),
      );
      await sleep(backoff);
      try {
        await db.$disconnect();
        await db.$connect();
      } catch {
      }
    }
  }
  throw lastError;
}

export function isRetryable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: unknown; message?: unknown; cause?: { code?: unknown } };
  const code = typeof e.code === "string" ? e.code : e.cause?.code;
  if (typeof code === "string" && RETRY_ERROR_CODES.has(code)) return true;
  const message = errorMessage(error);
  return RETRY_ERROR_PATTERNS.some((p) => message.toLowerCase().includes(p));
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
