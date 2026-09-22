import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { revalidatePath } from "next/cache";
import { createReview, getApprovedReviews, getReviewStats } from "@/lib/reviews";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// GET /api/reviews — public: APPROVED reviews only, paginated + stats.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Number(sp.get("page") || "1");
  const perPage = Number(sp.get("perPage") || "6");
  const [list, stats] = await Promise.all([
    getApprovedReviews({ page, perPage }),
    getReviewStats(),
  ]);
  return NextResponse.json({ ...list, stats });
}

// POST /api/reviews — public submission. Always creates PENDING; never visible
// until an admin approves. Honeypot + per-IP rate limit guard against spam.
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rl = rateLimit(`review:${ip}`, 3, 10 * 60 * 1000); // 3 / 10 min
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: real users never fill a hidden field. Pretend success so bots
  // don't learn they were caught, but persist nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true, moderation: true });
  }

  try {
    await createReview({
      customerName: body.customerName,
      rating: body.rating,
      reviewText: body.reviewText,
      email: body.email,
    });
    // Approved-review pages are dynamic, but revalidate anyway so any cached
    // layout picks up the (still hidden) pending item's absence consistently.
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, moderation: true }, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) {
      // Surface the first field + i18n key so the client shows localized copy.
      const first = e.issues[0];
      return NextResponse.json(
        { error: "validation", field: String(first?.path[0] ?? ""), key: first?.message ?? "failed" },
        { status: 422 }
      );
    }
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
