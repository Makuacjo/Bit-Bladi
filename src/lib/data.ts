import { prisma } from "./db";
import { mergeContent, type SiteContent } from "./content";
import type { MenuCategory, MenuItem, OrderConfig } from "./types";

export type SiteSettings = {
  businessName: string;
  currency: string;
  whatsappNumber: string;
  content: SiteContent;
};

export async function getSettings(): Promise<SiteSettings> {
  const row = await prisma.settings.findUnique({ where: { id: "singleton" } });
  let parsed: unknown = {};
  try {
    parsed = row?.content ? JSON.parse(row.content) : {};
  } catch {
    parsed = {};
  }
  return {
    businessName: row?.businessName ?? "Bit Bladi",
    currency: row?.currency ?? "KES",
    whatsappNumber: row?.whatsappNumber ?? "254798022831",
    content: mergeContent(parsed),
  };
}

export function orderConfig(s: SiteSettings): OrderConfig {
  return {
    businessName: s.businessName,
    currency: s.currency,
    whatsappNumber: s.whatsappNumber,
  };
}

export async function getCategories(includeDisabled = false): Promise<MenuCategory[]> {
  const rows = await prisma.category.findMany({
    where: includeDisabled ? {} : { enabled: true },
    orderBy: { sort: "asc" },
  });
  return rows.map((c) => ({ id: c.id, slug: c.slug, nameEn: c.nameEn, nameAr: c.nameAr }));
}

// Public menu = visible items only (Sold Out items stay visible but flagged as
// unavailable via `available: false`). Hidden items (visible: false) are excluded.
export async function getMenu(includeHidden = false): Promise<MenuItem[]> {
  const rows = await prisma.foodItem.findMany({
    where: includeHidden ? {} : { visible: true },
    include: { category: true },
    orderBy: [{ category: { sort: "asc" } }, { sort: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    nameEn: r.nameEn,
    nameAr: r.nameAr,
    descEn: r.descEn,
    descAr: r.descAr,
    price: r.price,
    image: r.image,
    categorySlug: r.category.slug,
    available: r.available,
    featured: r.featured,
    popular: r.popular,
  }));
}

export async function getActivePromotions() {
  const now = new Date();
  const rows = await prisma.promotion.findMany({
    where: {
      active: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    orderBy: { createdAt: "desc" },
  });
  return rows;
}

export async function getTestimonials() {
  return prisma.testimonial.findMany({
    where: { enabled: true },
    orderBy: { sort: "asc" },
  });
}
