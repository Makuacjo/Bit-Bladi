import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminReviews, getAdminReviewStats, type ReviewStatus } from "@/lib/reviews";

export const dynamic = "force-dynamic";

// GET /api/admin/reviews — authorized admins only. The proxy protects /admin
// pages but NOT /api/admin, so authorization is enforced here on the server.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const statusRaw = (sp.get("status") || "ALL").toUpperCase();
  const status = (["PENDING", "APPROVED", "REJECTED", "ALL"].includes(statusRaw)
    ? statusRaw
    : "ALL") as ReviewStatus | "ALL";
  const rating = sp.get("rating") ? Number(sp.get("rating")) : undefined;
  const q = sp.get("q") || undefined;
  const page = Number(sp.get("page") || "1");
  const perPage = Number(sp.get("perPage") || "20");

  const [list, stats] = await Promise.all([
    getAdminReviews({ status, rating, q, page, perPage }),
    getAdminReviewStats(),
  ]);
  return NextResponse.json({ ...list, stats });
}
