// Central SEO module — canonical domain, metadata builders and JSON-LD helpers.
// Everything that needs the production URL, the business NAP (name/address/phone)
// or a structured-data blob should go through here so titles, canonicals,
// hreflang and schema stay consistent across the site.

import type { Metadata } from "next";
import { locales, type Lang } from "./i18n";
import type { SiteSettings } from "./data";
import type { MenuCategory, MenuItem } from "./types";
import { localizedName, localizedDesc } from "./types";

// ── Canonical production domain ──────────────────────────────────────────────
// The site is served from bitbladi.com. SITE_URL may point at a temporary
// Hostinger preview domain (or lack a protocol); never let that leak into
// canonical URLs, the sitemap or robots.txt.
const PRODUCTION_URL = "https://bitbladi.com";

function resolveSiteUrl(): string {
  const raw = process.env.SITE_URL?.trim();
  if (raw && /^https?:\/\//i.test(raw) && !/hostingersite\.com/i.test(raw)) {
    return raw.replace(/\/+$/, "");
  }
  return PRODUCTION_URL;
}

export const SITE_URL = resolveSiteUrl();
export const DEFAULT_OG_IMAGE = "/uploads/hero-1.jpg";

export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// Per-page canonical + hreflang. `path` is the language-agnostic route
// (e.g. "" for home, "/menu", "/food/kisra").
export function buildAlternates(lang: Lang, path = ""): NonNullable<Metadata["alternates"]> {
  return {
    canonical: absoluteUrl(`/${lang}${path}`),
    languages: {
      en: absoluteUrl(`/en${path}`),
      ar: absoluteUrl(`/ar${path}`),
      "x-default": absoluteUrl(`/en${path}`),
    },
  };
}

export function ogLocale(lang: Lang): string {
  return lang === "ar" ? "ar_AR" : "en_US";
}

// Standard per-page metadata: title, description, canonical/hreflang, Open Graph
// and Twitter card. Relative image paths resolve against `metadataBase`
// (set in the root layout).
export function pageMetadata({
  lang,
  path,
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  absoluteTitle = false,
}: {
  lang: Lang;
  path: string;
  title: string;
  description: string;
  image?: string;
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(`/${lang}${path}`);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: buildAlternates(lang, path),
    openGraph: {
      type: "website",
      siteName: "Bit Bladi",
      title,
      description,
      url,
      locale: ogLocale(lang),
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

// ── JSON-LD structured data ──────────────────────────────────────────────────

const RESTAURANT_ID = `${SITE_URL}/#restaurant`;

// Only expose social profiles we can actually verify. The CMS ships with empty
// social fields, so we never emit a guessed/placeholder `sameAs`.
function verifiedSameAs(settings: SiteSettings): string[] {
  const { instagram, facebook, tiktok } = settings.content.social;
  return [instagram, facebook, tiktok].filter(
    (u): u is string => typeof u === "string" && /^https?:\/\//i.test(u)
  );
}

// Restaurant + LocalBusiness node. Reused (by @id) from every page's graph so
// there's a single, non-conflicting business entity for the whole site.
export function restaurantJsonLd(settings: SiteSettings) {
  const c = settings.content.contact;
  const sameAs = verifiedSameAs(settings);
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": RESTAURANT_ID,
    name: settings.businessName,
    description: settings.content.seo.description.en,
    servesCuisine: ["South Sudanese", "African", "East African"],
    priceRange: "$$",
    currenciesAccepted: settings.currency,
    url: absoluteUrl("/en"),
    telephone: c.phone,
    email: c.email,
    image: settings.content.hero.images
      .filter(Boolean)
      .map((img) => absoluteUrl(img)),
    hasMenu: absoluteUrl("/en/menu"),
    acceptsReservations: absoluteUrl("/en/reserve"),
    address: {
      "@type": "PostalAddress",
      streetAddress: c.address.en,
      addressLocality: "Kilimani",
      addressRegion: "Nairobi",
      addressCountry: "KE",
    },
    areaServed: [
      { "@type": "City", name: "Nairobi" },
      { "@type": "Place", name: "Kilimani" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "10:00",
        closes: "22:00",
      },
    ],
  };
  if (Number.isFinite(c.mapLat) && Number.isFinite(c.mapLng)) {
    node.geo = {
      "@type": "GeoCoordinates",
      latitude: c.mapLat,
      longitude: c.mapLng,
    };
  }
  if (sameAs.length) node.sameAs = sameAs;
  return node;
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Bit Bladi",
    url: absoluteUrl("/en"),
    inLanguage: ["en", "ar"],
    publisher: { "@id": RESTAURANT_ID },
  };
}

export function webPageJsonLd({
  lang,
  path,
  name,
  description,
}: {
  lang: Lang;
  path: string;
  name: string;
  description: string;
}) {
  const url = absoluteUrl(`/${lang}${path}`);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: lang,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": RESTAURANT_ID },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

// Full restaurant Menu with sections per category and MenuItem entries.
export function menuJsonLd(
  menu: MenuItem[],
  categories: MenuCategory[],
  lang: Lang,
  currency: string
) {
  const sections = categories
    .map((cat) => {
      const items = menu.filter((m) => m.categorySlug === cat.slug);
      if (!items.length) return null;
      return {
        "@type": "MenuSection",
        name: lang === "ar" ? cat.nameAr : cat.nameEn,
        hasMenuItem: items.map((it) => {
          const offer: Record<string, unknown> = {
            "@type": "Offer",
            price: it.price,
            priceCurrency: currency,
            availability: it.available
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          };
          const desc = localizedDesc(it, lang);
          const node: Record<string, unknown> = {
            "@type": "MenuItem",
            name: localizedName(it, lang),
            offers: offer,
          };
          if (desc) node.description = desc;
          if (it.image) node.image = absoluteUrl(it.image);
          return node;
        }),
      };
    })
    .filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": absoluteUrl(`/${lang}/menu#menu`),
    name: lang === "ar" ? "قائمة بيت بلدي" : "Bit Bladi Menu",
    inLanguage: lang,
    provider: { "@id": RESTAURANT_ID },
    hasMenuSection: sections,
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

export function isLocale(value: string): value is Lang {
  return (locales as readonly string[]).includes(value);
}
