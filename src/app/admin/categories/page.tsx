import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const cats = await prisma.category.findMany({
    orderBy: { sort: "asc" },
    include: { _count: { select: { items: true } } },
  });
  return (
    <CategoryManager
      categories={cats.map((c) => ({
        id: c.id,
        slug: c.slug,
        nameEn: c.nameEn,
        nameAr: c.nameAr,
        sort: c.sort,
        enabled: c.enabled,
        count: c._count.items,
      }))}
    />
  );
}
