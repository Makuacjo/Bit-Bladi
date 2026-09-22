"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession, createSessionToken, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { defaultContent, mergeContent } from "@/lib/content";
import { rateLimit, clientIp } from "@/lib/rate-limit";

async function guard() {
  const s = await getSession();
  if (!s) throw new Error("Unauthorized");
  return s;
}

function refreshPublic() {
  revalidatePath("/", "layout");
}

// ---------------- Auth ----------------
export async function loginAction(_prev: unknown, formData: FormData) {
  // Brute-force protection: cap login attempts per IP.
  const ip = clientIp(await headers());
  const rl = rateLimit(`login:${ip}`, 10, 10 * 60 * 1000); // 10 attempts / 10 min
  if (!rl.ok) return { error: "Too many attempts. Please try again in a few minutes." };

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();
  if (!email || !password) return { error: "Enter email and password." };

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }
  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  await setSessionCookie(token);

  // Redirect on the SERVER, after the cookie is set. This navigates with the new
  // session in place and returns a fresh RSC payload for the dashboard, so it
  // never hits the logged-out /admin entry cached in the client Router Cache
  // (the bug that made the dashboard appear only after a manual refresh).
  // redirect() throws NEXT_REDIRECT, so it must stay outside any try/catch.
  const from = String(formData.get("from") || "");
  const target = from.startsWith("/admin") && from !== "/admin/login" ? from : "/admin";
  redirect(target);
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}

// ---------------- Food ----------------
type FoodInput = {
  id?: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  price: number;
  image: string;
  categoryId: string;
  available: boolean;
  visible: boolean;
  featured: boolean;
  popular: boolean;
  sort: number;
};

export async function saveFood(input: FoodInput) {
  await guard();
  const data = {
    nameEn: input.nameEn.trim(),
    nameAr: input.nameAr.trim(),
    descEn: input.descEn.trim(),
    descAr: input.descAr.trim(),
    price: Math.max(0, Math.round(Number(input.price) || 0)),
    image: input.image.trim(),
    categoryId: input.categoryId,
    available: !!input.available,
    visible: !!input.visible,
    featured: !!input.featured,
    popular: !!input.popular,
    sort: Math.round(Number(input.sort) || 0),
  };
  if (!data.nameEn || !data.categoryId) throw new Error("Name and category are required.");
  if (input.id) await prisma.foodItem.update({ where: { id: input.id }, data });
  else await prisma.foodItem.create({ data });
  refreshPublic();
  revalidatePath("/admin/menu");
}

export async function deleteFood(id: string) {
  await guard();
  await prisma.foodItem.delete({ where: { id } });
  refreshPublic();
  revalidatePath("/admin/menu");
}

export async function toggleFoodAvailability(id: string, available: boolean) {
  await guard();
  await prisma.foodItem.update({ where: { id }, data: { available } });
  refreshPublic();
  revalidatePath("/admin/menu");
}

export async function setFoodVisibility(id: string, visible: boolean) {
  await guard();
  await prisma.foodItem.update({ where: { id }, data: { visible } });
  refreshPublic();
  revalidatePath("/admin/menu");
}

// ---------------- Category ----------------
type CategoryInput = {
  id?: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  sort: number;
  enabled: boolean;
};

export async function saveCategory(input: CategoryInput) {
  await guard();
  const slug = input.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const data = {
    slug: slug || `cat-${Date.now()}`,
    nameEn: input.nameEn.trim(),
    nameAr: input.nameAr.trim(),
    sort: Math.round(Number(input.sort) || 0),
    enabled: !!input.enabled,
  };
  if (!data.nameEn) throw new Error("Category name is required.");
  if (input.id) await prisma.category.update({ where: { id: input.id }, data });
  else await prisma.category.create({ data });
  refreshPublic();
  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  await guard();
  const count = await prisma.foodItem.count({ where: { categoryId: id } });
  if (count > 0) throw new Error(`Cannot delete: ${count} dishes use this category.`);
  await prisma.category.delete({ where: { id } });
  refreshPublic();
  revalidatePath("/admin/categories");
}

// ---------------- Promotion ----------------
type PromoInput = {
  id?: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  image: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
};

export async function savePromotion(input: PromoInput) {
  await guard();
  const data = {
    titleEn: input.titleEn.trim(),
    titleAr: input.titleAr.trim(),
    descEn: input.descEn.trim(),
    descAr: input.descAr.trim(),
    image: input.image.trim(),
    active: !!input.active,
    startsAt: input.startsAt ? new Date(input.startsAt) : null,
    endsAt: input.endsAt ? new Date(input.endsAt) : null,
  };
  if (!data.titleEn) throw new Error("Promotion title is required.");
  if (input.id) await prisma.promotion.update({ where: { id: input.id }, data });
  else await prisma.promotion.create({ data });
  refreshPublic();
  revalidatePath("/admin/promotions");
}

export async function deletePromotion(id: string) {
  await guard();
  await prisma.promotion.delete({ where: { id } });
  refreshPublic();
  revalidatePath("/admin/promotions");
}

// ---------------- Settings + Content ----------------
export async function saveSettings(input: {
  businessName: string;
  currency: string;
  whatsappNumber: string;
}) {
  await guard();
  await prisma.settings.update({
    where: { id: "singleton" },
    data: {
      businessName: input.businessName.trim() || "Bit Bladi",
      currency: input.currency.trim() || "KES",
      whatsappNumber: input.whatsappNumber.replace(/[^\d]/g, "") || "254798022831",
    },
  });
  refreshPublic();
  revalidatePath("/admin/settings");
}

export async function saveContent(contentJson: string) {
  await guard();
  let parsed: unknown;
  try {
    parsed = JSON.parse(contentJson);
  } catch {
    throw new Error("Invalid content data.");
  }
  const merged = mergeContent(parsed);
  await prisma.settings.update({
    where: { id: "singleton" },
    data: { content: JSON.stringify(merged) },
  });
  refreshPublic();
  revalidatePath("/admin/settings");
}

export async function resetContent() {
  await guard();
  await prisma.settings.update({
    where: { id: "singleton" },
    data: { content: JSON.stringify(defaultContent) },
  });
  refreshPublic();
  revalidatePath("/admin/settings");
}

// ---------------- Media ----------------
export async function deleteMedia(id: string) {
  await guard();
  await prisma.media.delete({ where: { id } });
  revalidatePath("/admin/media");
}
