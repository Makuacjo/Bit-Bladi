import type { CartLine, DeliveryDetails, OrderConfig } from "./types";
import type { Lang } from "./i18n";
import { localizedName } from "./types";

// Single source of truth for turning an order into a WhatsApp message.
// Never build WhatsApp strings anywhere else.
export function buildOrderMessage(
  items: CartLine[],
  details: DeliveryDetails,
  config: OrderConfig,
  lang: Lang
): string {
  const { businessName, currency } = config;
  const money = (n: number) => `${currency} ${n.toLocaleString(lang === "ar" ? "ar-EG" : "en-KE")}`;
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const L = lang === "ar";

  const lines: string[] = [];
  lines.push(L ? `*طلب ${businessName}*` : `*${businessName} Order*`);
  lines.push("");
  lines.push(L ? "*الطلب:*" : "*Order:*");
  for (const i of items) {
    lines.push(`${i.quantity} × ${localizedName(i, lang)} — ${money(i.price * i.quantity)}`);
  }
  lines.push("");
  lines.push(L ? `*الإجمالي: ${money(total)}*` : `*Total: ${money(total)}*`);
  lines.push("");
  lines.push(L ? "*تفاصيل التوصيل:*" : "*Delivery Details:*");
  lines.push(`${L ? "الاسم" : "Name"}: ${details.name}`);
  lines.push(`${L ? "الهاتف" : "Phone"}: ${details.phone}`);
  lines.push(`${L ? "المنطقة" : "Area"}: ${details.area}`);
  if (details.building) lines.push(`${L ? "المبنى" : "Building"}: ${details.building}`);
  if (details.floor) lines.push(`${L ? "الطابق" : "Floor"}: ${details.floor}`);
  if (details.room) lines.push(`${L ? "الغرفة" : "Room"}: ${details.room}`);
  if (details.notes) {
    lines.push("");
    lines.push(`${L ? "تعليمات" : "Notes"}: ${details.notes}`);
  }
  return lines.join("\n");
}

export function whatsappUrl(number: string, message: string): string {
  const digits = number.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
