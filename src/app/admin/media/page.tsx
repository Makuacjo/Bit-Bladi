import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { MediaManager } from "@/components/admin/MediaManager";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  await requireAdmin();
  const [media, foods, promos, settings] = await Promise.all([
    prisma.media.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.foodItem.findMany({ select: { image: true } }),
    prisma.promotion.findMany({ select: { image: true } }),
    prisma.settings.findUnique({ where: { id: "singleton" }, select: { content: true } }),
  ]);

  const refs = new Set<string>();
  foods.forEach((f) => f.image && refs.add(f.image));
  promos.forEach((p) => p.image && refs.add(p.image));
  if (settings?.content) {
    const matches = settings.content.match(/\/uploads\/[^"']+/g) || [];
    matches.forEach((m) => refs.add(m));
  }

  return (
    <MediaManager
      media={media.map((m) => ({ id: m.id, url: m.url, filename: m.filename, used: refs.has(m.url) }))}
    />
  );
}
