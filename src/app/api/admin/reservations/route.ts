import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminReservations, getAdminReservationStats, type ReservationStatus } from "@/lib/reservations";

export const dynamic = "force-dynamic";

const STATUSES = ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED", "NO_SHOW", "ALL"];

// GET /api/admin/reservations — authorized admins only (the proxy protects
// /admin pages but NOT /api/admin, so authz is enforced here).
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const statusRaw = (sp.get("status") || "ALL").toUpperCase();
  const status = (STATUSES.includes(statusRaw) ? statusRaw : "ALL") as ReservationStatus | "ALL";
  const date = sp.get("date") || undefined;
  const q = sp.get("q") || undefined;
  const page = Number(sp.get("page") || "1");
  const perPage = Number(sp.get("perPage") || "20");

  const [list, stats] = await Promise.all([
    getAdminReservations({ status, date, q, page, perPage }),
    getAdminReservationStats(),
  ]);
  return NextResponse.json({ ...list, stats });
}
