import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL || "http://localhost:3000";
  const paths = ["", "/menu"];
  const now = new Date();
  return locales.flatMap((lang) =>
    paths.map((p) => ({
      url: `${base}/${lang}${p}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.8,
    }))
  );
}
