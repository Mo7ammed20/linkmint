import { z } from "zod";
import { dbQuery } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handleError, ok, readJson } from "@/lib/api";

const createSchema = z.object({
  amount: z.number().positive().max(1_000_000),
  method: z.enum(["paypal", "bank", "crypto", "stripe"]),
});

export async function GET() {
  try {
    const user = await requireUser();
    const payouts = await dbQuery((p) =>
      p.payout.findMany({
        where: user.role === "admin" ? {} : { userId: user.id },
        orderBy: { requestedAt: "desc" },
      }),
    );
    return ok({ payouts });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const parsed = await readJson(req, createSchema);
    if (!parsed.ok) return parsed.res;
    const { amount, method } = parsed.data;
    if (amount > user.totalEarnings) {
      return Response.json({ error: "Amount exceeds available balance" }, { status: 400 });
    }
    const payout = await dbQuery((p) =>
      p.payout.create({
        data: { userId: user.id, amount, method, status: "pending" },
      }),
    );
    await dbQuery((p) =>
      p.user.update({
        where: { id: user.id },
        data: { totalEarnings: { decrement: amount } },
      }),
    );
    await dbQuery((p) =>
      p.auditEntry.create({
        data: {
          actorId: user.id,
          actorName: user.name,
          action: "payout.request",
          target: payout.id,
          ip: "0.0.0.0",
        },
      }),
    );
    return ok({ payout });
  } catch (e) {
    return handleError(e);
  }
}
