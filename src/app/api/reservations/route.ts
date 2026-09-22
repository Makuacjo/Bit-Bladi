import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createReservation } from "@/lib/reservations";
import { notifyCustomer, notifyRestaurant } from "@/lib/notify";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// POST /api/reservations — public. Creates a PENDING reservation after a fresh
// availability check, then fires (best-effort) notifications and records their
// real delivery status. Honeypot + per-IP rate limit guard against abuse.
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rl = rateLimit(`reservation:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot — bots fill a hidden field; humans don't. Pretend success, save nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true, moderation: true });
  }

  let result;
  try {
    result = await createReservation({
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      date: body.date,
      time: body.time,
      guestCount: body.guestCount,
      specialRequests: body.specialRequests,
      preferredLanguage: body.preferredLanguage,
    });
  } catch (e) {
    if (e instanceof ZodError) {
      const first = e.issues[0];
      return NextResponse.json(
        { error: "validation", field: String(first?.path[0] ?? ""), key: first?.message ?? "failed" },
        { status: 422 }
      );
    }
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  if (!result.ok) {
    return NextResponse.json({ error: "unavailable" }, { status: 409 });
  }

  // Notifications are independent of persistence: the reservation already exists.
  try {
    const full = await prisma.reservation.findUnique({ where: { id: result.id } });
    if (full) {
      const { emailStatus, whatsappStatus } = await notifyCustomer("received", full);
      await prisma.reservation.update({ where: { id: full.id }, data: { emailStatus, whatsappStatus } });
      await notifyRestaurant(full);
    }
  } catch {
    /* swallow — a notification failure must not fail the reservation */
  }

  revalidatePath("/admin/reservations");
  return NextResponse.json({ ok: true, reservation: result.reservation }, { status: 201 });
}
