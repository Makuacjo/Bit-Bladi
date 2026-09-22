import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getReservationById, isSlotAvailable, canTransition, type ReservationStatus } from "@/lib/reservations";
import { notifyCustomer } from "@/lib/notify";

export const dynamic = "force-dynamic";

const ACTION_TO_STATUS: Record<string, ReservationStatus> = {
  confirm: "CONFIRMED",
  reject: "REJECTED",
  cancel: "CANCELLED",
  complete: "COMPLETED",
  no_show: "NO_SHOW",
};
// Which status changes notify the customer, and with which template.
const NOTIFY_EVENT: Partial<Record<ReservationStatus, "confirmed" | "rejected" | "cancelled">> = {
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
};

// GET /api/admin/reservations/:id
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const r = await getReservationById(id);
  if (!r) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ reservation: r });
}

// PATCH /api/admin/reservations/:id
//   { action: "confirm"|"reject"|"cancel"|"complete"|"no_show" }
//   { action: "assign", table: "<string>" }
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const action = String(body.action || "");

  const current = await getReservationById(id);
  if (!current) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Table assignment (no status change).
  if (action === "assign") {
    const table = String(body.table || "").slice(0, 60);
    await prisma.reservation.update({ where: { id }, data: { assignedTable: table } });
    revalidatePath("/admin/reservations");
    return NextResponse.json({ ok: true });
  }

  const target = ACTION_TO_STATUS[action];
  if (!target) return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  if (!canTransition(current.status, target)) {
    return NextResponse.json({ error: "invalid_transition", from: current.status, to: target }, { status: 409 });
  }

  // Re-validate availability at confirm time (never trust the earlier check).
  if (target === "CONFIRMED") {
    const ok = await isSlotAvailable(current.date, current.time, current.guestCount, current.id);
    if (!ok) return NextResponse.json({ error: "unavailable" }, { status: 409 });
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: {
      status: target,
      ...(target === "CONFIRMED" && typeof body.table === "string" ? { assignedTable: String(body.table).slice(0, 60) } : {}),
    },
  });

  // Fire the matching customer notification and record real delivery status.
  const event = NOTIFY_EVENT[target];
  if (event) {
    try {
      const { emailStatus, whatsappStatus } = await notifyCustomer(event, updated);
      await prisma.reservation.update({ where: { id }, data: { emailStatus, whatsappStatus } });
    } catch {
      /* notification failure must not roll back the status change */
    }
  }

  revalidatePath("/admin/reservations");
  return NextResponse.json({ ok: true, status: target });
}
