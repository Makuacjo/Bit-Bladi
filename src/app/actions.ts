"use server";

import { prisma } from "@/lib/db";

export type ValidatedLine = {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  image: string;
  quantity: number;
};

export type InvalidLine = {
  id: string;
  nameEn: string;
  nameAr: string;
  reason: "sold_out" | "hidden" | "missing";
};

export type CartValidation = {
  ok: boolean;
  lines: ValidatedLine[];
  invalid: InvalidLine[];
  total: number;
};

// Authoritative availability + price check. The customer's client values are
// never trusted: prices and availability come straight from the database.
export async function validateCart(
  items: { id: string; quantity: number }[]
): Promise<CartValidation> {
  const ids = items.map((i) => i.id);
  const rows = await prisma.foodItem.findMany({ where: { id: { in: ids } } });
  const byId = new Map(rows.map((r) => [r.id, r]));

  const lines: ValidatedLine[] = [];
  const invalid: InvalidLine[] = [];

  for (const item of items) {
    const row = byId.get(item.id);
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 0));
    if (!row) {
      invalid.push({ id: item.id, nameEn: "Item", nameAr: "عنصر", reason: "missing" });
      continue;
    }
    if (!row.visible) {
      invalid.push({ id: row.id, nameEn: row.nameEn, nameAr: row.nameAr, reason: "hidden" });
      continue;
    }
    if (!row.available) {
      invalid.push({ id: row.id, nameEn: row.nameEn, nameAr: row.nameAr, reason: "sold_out" });
      continue;
    }
    lines.push({
      id: row.id,
      nameEn: row.nameEn,
      nameAr: row.nameAr,
      price: row.price, // authoritative price
      image: row.image,
      quantity: qty,
    });
  }

  const total = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  return { ok: invalid.length === 0, lines, invalid, total };
}
