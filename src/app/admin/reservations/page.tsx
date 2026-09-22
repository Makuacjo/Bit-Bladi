import { requireAdmin } from "@/lib/admin";
import { ReservationManager } from "@/components/admin/ReservationManager";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage() {
  await requireAdmin();
  return <ReservationManager />;
}
