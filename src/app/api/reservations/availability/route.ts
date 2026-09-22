import { NextRequest, NextResponse } from "next/server";
import { getAvailability, generateSlots, RES_CONFIG } from "@/lib/reservations";

export const dynamic = "force-dynamic";

// GET /api/reservations/availability?date=YYYY-MM-DD&guests=N — public.
// Returns per-slot availability for the customer time picker.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const date = sp.get("date") || "";
  const guests = Number(sp.get("guests") || "2");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "invalid_date", slots: [] }, { status: 400 });
  }
  const slots = await getAvailability(date, guests);
  return NextResponse.json({
    date,
    slots,
    config: {
      maxGuests: RES_CONFIG.maxGuestsPerBooking,
      allSlots: generateSlots(),
    },
  });
}
