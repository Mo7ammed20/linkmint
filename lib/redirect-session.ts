import { SignJWT, jwtVerify } from "jose";

const SESSION_TTL_SECONDS = 10 * 60;
const STEP_SECONDS = 30;
const TOTAL_STEPS = 3;

interface RedirectSessionPayload {
  linkId: string;
  shortCode: string;
  title: string | null;
  description: string | null;
  destination: string;
  stepStartedAt: number;
  currentStep: number;
}

function secret(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (!raw && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required");
  }
  return new TextEncoder().encode(raw ?? "dev-only-insecure-secret");
}

export async function createRedirectSession(input: {
  linkId: string;
  shortCode: string;
  destination: string;
  title: string | null;
  description: string | null;
}): Promise<string> {
  const payload: RedirectSessionPayload = {
    linkId: input.linkId,
    shortCode: input.shortCode,
    title: input.title,
    description: input.description,
    destination: input.destination,
    stepStartedAt: Date.now(),
    currentStep: 1,
  };
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secret());
}

export async function verifyRedirectSession(token: string): Promise<RedirectSessionPayload> {
  const { payload } = await jwtVerify(token, secret());
  return {
    linkId: String(payload.linkId),
    shortCode: String(payload.shortCode),
    title: (payload.title as string | null) ?? null,
    description: (payload.description as string | null) ?? null,
    destination: String(payload.destination),
    stepStartedAt: Number(payload.stepStartedAt),
    currentStep: Number(payload.currentStep ?? 1),
  };
}

export async function advanceStep(
  token: string,
  expectedStep: number,
  minElapsedMs = 28_000,
): Promise<string> {
  const session = await verifyRedirectSession(token);
  if (session.currentStep !== expectedStep) {
    throw new StepError("Invalid step", 400);
  }
  const elapsed = Date.now() - session.stepStartedAt;
  if (elapsed < minElapsedMs) {
    throw new StepError("Too fast", 429);
  }
  const nextStep = expectedStep + 1;
  const updated: RedirectSessionPayload = {
    ...session,
    currentStep: nextStep,
    stepStartedAt: Date.now(),
  };
  return new SignJWT({ ...updated })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secret());
}

export async function completeSession(token: string): Promise<RedirectSessionPayload> {
  const session = await verifyRedirectSession(token);
  if (session.currentStep < TOTAL_STEPS + 1) {
    throw new StepError("Steps not complete", 403);
  }
  return session;
}

export const REDIRECT_STEP_SECONDS = STEP_SECONDS;
export const REDIRECT_TOTAL_STEPS = TOTAL_STEPS;

export class StepError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
