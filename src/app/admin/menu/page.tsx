import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { FoodManager } from "@/components/admin/FoodManager";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  await requireAdmin();
  const [foods, categories] = await Promise.all([
    prisma.foodItem.findMany({ orderBy: [{ categoryId: "asc" }, { sort: "asc" }] }),
    prisma.category.findMany({ orderBy: { sort: "asc" } }),
  ]);

  return (
    <FoodManager
      foods={foods.map((f) => ({
        id: f.id,
        nameEn: f.nameEn,
        nameAr: f.nameAr,
        descEn: f.descEn,
        descAr: f.descAr,
        price: f.price,
        image: f.image,
        categoryId: f.categoryId,
        available: f.available,
        visible: f.visible,
        featured: f.featured,
        popular: f.popular,
        sort: f.sort,
      }))}
      categories={categories.map((c) => ({ id: c.id, nameEn: c.nameEn, nameAr: c.nameAr }))}
    />
  );
}
