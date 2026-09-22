import type { Lang } from "./i18n";

export function formatPrice(amount: number, currency: string, lang: Lang): string {
  const locale = lang === "ar" ? "ar-EG" : "en-KE";
  const n = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount);
  return lang === "ar" ? `${n} ${currency}` : `${currency} ${n}`;
}

export function formatReviewDate(iso: string, lang: Lang): string {
  const locale = lang === "ar" ? "ar-EG" : "en-GB";
  try {
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(
      new Date(iso)
    );
  } catch {
    return "";
  }
}
