import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { SITE_URL } from "@/lib/seo";

// Language-agnostic indexable routes. Admin, API, login and cart flows are
// intentionally excluded. Each path is emitted per locale with hreflang
// alternates pointing at the other language.
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/menu", priority: 0.9, changeFrequency: "weekly" },
  { path: "/food/south-sudanese-food", priority: 0.8, changeFrequency: "monthly" },
  { path: "/food/kisra", priority: 0.8, changeFrequency: "monthly" },
  { path: "/locations/nairobi", priority: 0.7, changeFrequency: "monthly" },
  { path: "/locations/kilimani", priority: 0.7, changeFrequency: "monthly" },
  { path: "/reserve", priority: 0.6, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return locales.flatMap((lang) =>
    ROUTES.map((r) => ({
      url: `${SITE_URL}/${lang}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
      alternates: {
        languages: {
          en: `${SITE_URL}/en${r.path}`,
          ar: `${SITE_URL}/ar${r.path}`,
          "x-default": `${SITE_URL}/en${r.path}`,
        },
      },
    }))
  );
}
