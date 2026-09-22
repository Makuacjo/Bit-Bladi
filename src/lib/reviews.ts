import "server-only";
import { z } from "zod";
import { prisma } from "./db";

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

// What the public site is allowed to see — note: no email, no status leak.
export type PublicReview = {
  id: string;
  customerName: string;
  rating: number;
  reviewText: string;
  createdAt: string; // ISO
};

export type ReviewStats = {
  average: number; // 0 when no approved reviews
  total: number; // approved only
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type AdminReview = {
  id: string;
  customerName: string;
  rating: number;
  reviewText: string;
  email: string | null;
  status: ReviewStatus;
  createdAt: string;
  approvedAt: string | null;
};

export const REVIEW_LIMITS = {
  name: { min: 1, max: 80 },
  text: { min: 3, max: 1500 },
  email: { max: 160 },
} as const;

// Strip HTML tags + control chars and collapse whitespace. React escapes on
// render, but we also refuse to persist markup so stored data stays clean and
// stored-XSS is impossible even if the text is rendered elsewhere (e.g. export).
// Tabs/newlines are preserved; all other C0/C1 control chars are removed.
function sanitize(input: string): string {
  const noTags = input.replace(/<[^>]*>/g, "");
  let out = "";
  for (const ch of noTags) {
    const code = ch.codePointAt(0)!;
    const isControl = (code >= 0 && code <= 31 && ch !== "\n" && ch !== "\t") || (code >= 127 && code <= 159);
    if (!isControl) out += ch;
  }
  return out
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Input contract for a public submission. Coercion + bounds live here so both
// the API route and any server action share identical validation. The refine
// messages are i18n keys the client maps to localized copy.
export const reviewInputSchema = z.object({
  customerName: z
    .string()
    .transform(sanitize)
    .pipe(z.string().min(REVIEW_LIMITS.name.min, "name").max(REVIEW_LIMITS.name.max, "name")),
  rating: z.coerce.number().int("rating").min(1, "rating").max(5, "rating"),
  reviewText: z
    .string()
    .transform(sanitize)
    .pipe(z.string().min(REVIEW_LIMITS.text.min, "textShort").max(REVIEW_LIMITS.text.max, "textLong")),
  email: z
    .union([z.string().max(REVIEW_LIMITS.email.max), z.literal(""), z.undefined(), z.null()])
    .transform((v) => (v ? String(v).trim() : ""))
    .refine((v) => v === "" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "email")
    .transform((v) => (v === "" ? null : v.toLowerCase())),
});

export type ReviewInput = z.input<typeof reviewInputSchema>;

export async function createReview(raw: unknown): Promise<{ id: string }> {
  const data = reviewInputSchema.parse(raw);
  const created = await prisma.review.create({
    data: {
      customerName: data.customerName,
      rating: data.rating,
      reviewText: data.reviewText,
      email: data.email,
      status: "PENDING", // always — a customer can never self-approve
    },
    select: { id: true },
  });
  return created;
}

const PAGE_MAX = 50;

// ---------- Public reads (APPROVED only) ----------
export async function getApprovedReviews(opts: { page?: number; perPage?: number } = {}) {
  const perPage = Math.min(PAGE_MAX, Math.max(1, opts.perPage ?? 6));
  const page = Math.max(1, opts.page ?? 1);
  const where = { status: "APPROVED" as const };
  const [rows, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * perPage,
      take: perPage,
      // Explicit select — email and status are never sent to the public.
      select: { id: true, customerName: true, rating: true, reviewText: true, createdAt: true },
    }),
    prisma.review.count({ where }),
  ]);
  const reviews: PublicReview[] = rows.map((r) => ({
    id: r.id,
    customerName: r.customerName,
    rating: r.rating,
    reviewText: r.reviewText,
    createdAt: r.createdAt.toISOString(),
  }));
  return { reviews, total, page, perPage, hasMore: page * perPage < total };
}

export async function getReviewStats(): Promise<ReviewStats> {
  const grouped = await prisma.review.groupBy({
    by: ["rating"],
    where: { status: "APPROVED" },
    _count: { _all: true },
  });
  const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let sum = 0;
  for (const g of grouped) {
    const r = g.rating as 1 | 2 | 3 | 4 | 5;
    const c = g._count._all;
    if (r >= 1 && r <= 5) breakdown[r] = c;
    total += c;
    sum += r * c;
  }
  const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
  return { average, total, breakdown };
}

// ---------- Admin reads (all statuses, includes private email) ----------
export async function getAdminReviews(opts: {
  status?: ReviewStatus | "ALL";
  rating?: number;
  q?: string;
  page?: number;
  perPage?: number;
}) {
  const perPage = Math.min(PAGE_MAX, Math.max(1, opts.perPage ?? 20));
  const page = Math.max(1, opts.page ?? 1);
  const where: Record<string, unknown> = {};
  if (opts.status && opts.status !== "ALL") where.status = opts.status;
  if (opts.rating && opts.rating >= 1 && opts.rating <= 5) where.rating = opts.rating;
  if (opts.q && opts.q.trim()) {
    const q = opts.q.trim();
    where.OR = [{ customerName: { contains: q } }, { reviewText: { contains: q } }];
  }
  const [rows, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.review.count({ where }),
  ]);
  const reviews: AdminReview[] = rows.map((r) => ({
    id: r.id,
    customerName: r.customerName,
    rating: r.rating,
    reviewText: r.reviewText,
    email: r.email,
    status: r.status as ReviewStatus,
    createdAt: r.createdAt.toISOString(),
    approvedAt: r.approvedAt ? r.approvedAt.toISOString() : null,
  }));
  return { reviews, total, page, perPage, hasMore: page * perPage < total };
}

export async function getAdminReviewStats() {
  const [total, pending, approved, rejected] = await Promise.all([
    prisma.review.count(),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { status: "APPROVED" } }),
    prisma.review.count({ where: { status: "REJECTED" } }),
  ]);
  const { average } = await getReviewStats();
  return { total, pending, approved, rejected, average };
}

// ---------- Admin mutations ----------
export async function approveReview(id: string) {
  return prisma.review.update({
    where: { id },
    data: { status: "APPROVED", approvedAt: new Date() },
    select: { id: true },
  });
}

export async function rejectReview(id: string) {
  return prisma.review.update({
    where: { id },
    data: { status: "REJECTED", approvedAt: null },
    select: { id: true },
  });
}

export async function deleteReview(id: string) {
  return prisma.review.delete({ where: { id }, select: { id: true } });
}
