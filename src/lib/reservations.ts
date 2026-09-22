import "server-only";
import { z } from "zod";
import { prisma } from "./db";

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

export type NotifyStatus = "PENDING" | "SENT" | "FAILED" | "SKIPPED";

// Reservation configuration. Kept here (not the CMS) to bound scope; documented
// as the single place to tune hours/capacity/slots. The restaurant runs in
// Nairobi (KES, Kilimani) — dates/times are stored as restaurant-local strings,
// so this timezone only affects "is this slot in the past?" and display.
export const RES_CONFIG = {
  timezone: "Africa/Nairobi",
  openTime: "10:00", // first seating
  closeTime: "22:00", // kitchen close; last seating = closeTime - durationMinutes
  slotMinutes: 30,
  durationMinutes: 90, // a table is held this long per booking
  capacity: 40, // total covers seatable per overlapping window
  maxGuestsPerBooking: 12,
} as const;

// Statuses that still occupy capacity for availability math.
const ACTIVE_STATUSES = ["PENDING", "CONFIRMED"] as const;

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const pad = (n: number) => String(n).padStart(2, "0");
const fromMin = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

/** All bookable slot times (HH:MM) for a normal service day. */
export function generateSlots(): string[] {
  const start = toMin(RES_CONFIG.openTime);
  const lastSeating = toMin(RES_CONFIG.closeTime) - RES_CONFIG.durationMinutes;
  const out: string[] = [];
  for (let t = start; t <= lastSeating; t += RES_CONFIG.slotMinutes) out.push(fromMin(t));
  return out;
}

/** Current date/time in the restaurant timezone (avoids server-tz drift). */
export function nowInTz(): { date: string; minutes: number } {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: RES_CONFIG.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  let hour = Number(parts.hour);
  if (hour === 24) hour = 0; // some engines emit 24 at midnight
  return { date, minutes: hour * 60 + Number(parts.minute) };
}

function overlaps(aStart: number, bStart: number) {
  const dur = RES_CONFIG.durationMinutes;
  return aStart < bStart + dur && bStart < aStart + dur;
}

/**
 * Seats already committed on `date` in windows overlapping `time`. Sums the
 * guestCount of PENDING+CONFIRMED reservations whose held window overlaps.
 */
async function seatsUsed(date: string, time: string, excludeId?: string): Promise<number> {
  const rows = await prisma.reservation.findMany({
    where: { date, status: { in: [...ACTIVE_STATUSES] }, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    select: { time: true, guestCount: true },
  });
  const reqStart = toMin(time);
  return rows.reduce((sum, r) => (overlaps(reqStart, toMin(r.time)) ? sum + r.guestCount : sum), 0);
}

export async function isSlotAvailable(
  date: string,
  time: string,
  guests: number,
  excludeId?: string
): Promise<boolean> {
  if (!generateSlots().includes(time)) return false;
  if (guests < 1 || guests > RES_CONFIG.maxGuestsPerBooking) return false;
  // Reject past slots (restaurant-local).
  const now = nowInTz();
  if (date < now.date) return false;
  if (date === now.date && toMin(time) < now.minutes) return false;
  const used = await seatsUsed(date, time, excludeId);
  return used + guests <= RES_CONFIG.capacity;
}

/** Per-slot availability for a date, for the customer time picker. */
export async function getAvailability(date: string, guests: number) {
  const slots = generateSlots();
  const now = nowInTz();
  const rows = await prisma.reservation.findMany({
    where: { date, status: { in: [...ACTIVE_STATUSES] } },
    select: { time: true, guestCount: true },
  });
  const g = Math.max(1, Math.min(RES_CONFIG.maxGuestsPerBooking, Math.floor(guests) || 1));
  return slots.map((time) => {
    const reqStart = toMin(time);
    const used = rows.reduce((s, r) => (overlaps(reqStart, toMin(r.time)) ? s + r.guestCount : s), 0);
    const past = date < now.date || (date === now.date && reqStart < now.minutes);
    const available = !past && used + g <= RES_CONFIG.capacity;
    return { time, available, seatsLeft: Math.max(0, RES_CONFIG.capacity - used) };
  });
}

// ---------- unique human-readable code ----------
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I
function randomCode() {
  let s = "";
  for (let i = 0; i < 6; i++) s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return `BB-${s}`;
}
async function uniqueCode(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const code = randomCode();
    const exists = await prisma.reservation.findUnique({ where: { code }, select: { id: true } });
    if (!exists) return code;
  }
  throw new Error("Could not generate a unique reservation code.");
}

// ---------- validation ----------
function sanitize(input: string): string {
  const noTags = input.replace(/<[^>]*>/g, "");
  let out = "";
  for (const ch of noTags) {
    const c = ch.codePointAt(0)!;
    if (!((c >= 0 && c <= 31 && ch !== "\n" && ch !== "\t") || (c >= 127 && c <= 159))) out += ch;
  }
  return out.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export const reservationInputSchema = z.object({
  customerName: z.string().transform(sanitize).pipe(z.string().min(1, "name").max(80, "name")),
  customerPhone: z
    .string()
    .transform((v) => sanitize(v))
    .pipe(z.string().min(7, "phone").max(24, "phone"))
    .refine((v) => /^\+?[0-9\s().-]{7,24}$/.test(v), "phone"),
  customerEmail: z
    .string()
    .transform((v) => sanitize(v).toLowerCase())
    .refine((v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "email"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "time"),
  guestCount: z.coerce.number().int("guests").min(1, "guests").max(RES_CONFIG.maxGuestsPerBooking, "guests"),
  specialRequests: z
    .union([z.string(), z.undefined(), z.null()])
    .transform((v) => (v ? sanitize(String(v)).slice(0, 1000) : "")),
  preferredLanguage: z.enum(["en", "ar"]).catch("en"),
});

export type ReservationInput = z.input<typeof reservationInputSchema>;

export type PublicReservation = {
  code: string;
  customerName: string;
  date: string;
  time: string;
  guestCount: number;
  status: ReservationStatus;
};

/** Create a PENDING reservation after a fresh availability check. */
export async function createReservation(raw: unknown): Promise<
  { ok: true; reservation: PublicReservation; id: string } | { ok: false; reason: "unavailable" }
> {
  const data = reservationInputSchema.parse(raw);
  if (!(await isSlotAvailable(data.date, data.time, data.guestCount))) {
    return { ok: false, reason: "unavailable" };
  }
  const code = await uniqueCode();
  const r = await prisma.reservation.create({
    data: {
      code,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      date: data.date,
      time: data.time,
      guestCount: data.guestCount,
      specialRequests: data.specialRequests,
      preferredLanguage: data.preferredLanguage,
      status: "PENDING", // never auto-confirmed
    },
  });
  return {
    ok: true,
    id: r.id,
    reservation: {
      code: r.code,
      customerName: r.customerName,
      date: r.date,
      time: r.time,
      guestCount: r.guestCount,
      status: r.status as ReservationStatus,
    },
  };
}

// ---------- admin reads ----------
export type AdminReservation = {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  time: string;
  guestCount: number;
  specialRequests: string;
  status: ReservationStatus;
  preferredLanguage: string;
  assignedTable: string;
  emailStatus: NotifyStatus;
  whatsappStatus: NotifyStatus;
  createdAt: string;
};

const PAGE_MAX = 50;

export async function getAdminReservations(opts: {
  status?: ReservationStatus | "ALL";
  date?: string;
  q?: string;
  page?: number;
  perPage?: number;
}) {
  const perPage = Math.min(PAGE_MAX, Math.max(1, opts.perPage ?? 20));
  const page = Math.max(1, opts.page ?? 1);
  const where: Record<string, unknown> = {};
  if (opts.status && opts.status !== "ALL") where.status = opts.status;
  if (opts.date && /^\d{4}-\d{2}-\d{2}$/.test(opts.date)) where.date = opts.date;
  if (opts.q && opts.q.trim()) {
    const q = opts.q.trim();
    where.OR = [
      { customerName: { contains: q } },
      { customerPhone: { contains: q } },
      { code: { contains: q.toUpperCase() } },
      { customerEmail: { contains: q.toLowerCase() } },
    ];
  }
  const [rows, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      orderBy: [{ date: "asc" }, { time: "asc" }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.reservation.count({ where }),
  ]);
  const reservations: AdminReservation[] = rows.map((r) => ({
    id: r.id,
    code: r.code,
    customerName: r.customerName,
    customerPhone: r.customerPhone,
    customerEmail: r.customerEmail,
    date: r.date,
    time: r.time,
    guestCount: r.guestCount,
    specialRequests: r.specialRequests,
    status: r.status as ReservationStatus,
    preferredLanguage: r.preferredLanguage,
    assignedTable: r.assignedTable,
    emailStatus: r.emailStatus as NotifyStatus,
    whatsappStatus: r.whatsappStatus as NotifyStatus,
    createdAt: r.createdAt.toISOString(),
  }));
  return { reservations, total, page, perPage, hasMore: page * perPage < total };
}

export async function getAdminReservationStats() {
  const [total, pending, confirmed, cancelled, rejected, completed, noShow] = await Promise.all([
    prisma.reservation.count(),
    prisma.reservation.count({ where: { status: "PENDING" } }),
    prisma.reservation.count({ where: { status: "CONFIRMED" } }),
    prisma.reservation.count({ where: { status: "CANCELLED" } }),
    prisma.reservation.count({ where: { status: "REJECTED" } }),
    prisma.reservation.count({ where: { status: "COMPLETED" } }),
    prisma.reservation.count({ where: { status: "NO_SHOW" } }),
  ]);
  return { total, pending, confirmed, cancelled, rejected, completed, noShow };
}

export function getReservationById(id: string) {
  return prisma.reservation.findUnique({ where: { id } });
}

// Allowed status transitions from PENDING (and a couple from CONFIRMED).
const TRANSITIONS: Record<string, ReservationStatus[]> = {
  PENDING: ["CONFIRMED", "REJECTED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "NO_SHOW", "CANCELLED"],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
  NO_SHOW: [],
};

export function canTransition(from: string, to: ReservationStatus) {
  return (TRANSITIONS[from] ?? []).includes(to);
}
