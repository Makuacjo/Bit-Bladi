import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { PromotionManager } from "@/components/admin/PromotionManager";

export const dynamic = "force-dynamic";

const dstr = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

export default async function AdminPromotionsPage() {
  await requireAdmin();
  const promos = await prisma.promotion.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <PromotionManager
      promotions={promos.map((p) => ({
        id: p.id,
        titleEn: p.titleEn,
        titleAr: p.titleAr,
        descEn: p.descEn,
        descAr: p.descAr,
        image: p.image,
        active: p.active,
        startsAt: dstr(p.startsAt),
        endsAt: dstr(p.endsAt),
      }))}
    />
  );
}
