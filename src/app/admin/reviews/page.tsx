import { requireAdmin } from "@/lib/admin";
import { ReviewManager } from "@/components/admin/ReviewManager";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await requireAdmin();
  return <ReviewManager />;
}
