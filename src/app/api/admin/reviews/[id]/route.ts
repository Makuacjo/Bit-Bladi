import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { approveReview, rejectReview, deleteReview } from "@/lib/reviews";

export const dynamic = "force-dynamic";

// Make approve/reject/delete take effect on the public site without a redeploy.
function refreshPublic() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/reviews");
}

// PATCH /api/admin/reviews/:id  { action: "approve" | "reject" }
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  let action = "";
  try {
    action = String((await req.json())?.action || "");
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    if (action === "approve") await approveReview(id);
    else if (action === "reject") await rejectReview(id);
    else return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  refreshPublic();
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/reviews/:id
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  try {
    await deleteReview(id);
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  refreshPublic();
  return NextResponse.json({ ok: true });
}
