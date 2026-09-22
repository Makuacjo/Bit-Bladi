import type { Lang } from "./i18n";

// Plain, serialisable food item used across public UI + cart.
export type MenuItem = {
  id: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  price: number;
  image: string;
  categorySlug: string;
  available: boolean;
  featured: boolean;
  popular: boolean;
};

export type MenuCategory = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
};

export type CartLine = {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  image: string;
  quantity: number;
};

export type DeliveryDetails = {
  name: string;
  phone: string;
  area: string;
  building: string;
  room: string;
  floor: string;
  notes: string;
};

export type OrderConfig = {
  businessName: string;
  currency: string;
  whatsappNumber: string;
};

export function localizedName(
  item: { nameEn: string; nameAr: string },
  lang: Lang
): string {
  return lang === "ar" ? item.nameAr || item.nameEn : item.nameEn;
}

export function localizedDesc(
  item: { descEn: string; descAr: string },
  lang: Lang
): string {
  return lang === "ar" ? item.descAr || item.descEn : item.descEn;
}
