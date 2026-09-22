// Shape of the editable site content stored in Settings.content (JSON).
// Every customer-facing string lives here so the CMS can edit it without code.

export type Bilingual = { en: string; ar: string };

export type SiteContent = {
  hero: {
    title: Bilingual;
    subtitle: Bilingual;
    ctaLabel: Bilingual;
    images: string[]; // rotating background images
  };
  about: {
    heading: Bilingual;
    body: Bilingual;
  };
  whyUs: {
    heading: Bilingual;
    items: { title: Bilingual; body: Bilingual }[];
  };
  delivery: {
    heading: Bilingual;
    body: Bilingual;
    etaMinutes: string;
    fee: Bilingual;
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: Bilingual;
    hours: Bilingual;
    mapLat: number;
    mapLng: number;
    plusCode: string;
    // Free-text place query used for the Google Maps embed + directions links.
    // Kept separate from the display address so the map resolves reliably.
    mapQuery: string;
  };
  social: { instagram: string; facebook: string; tiktok: string };
  footer: {
    tagline: Bilingual;
    copyright: Bilingual;
  };
  seo: {
    title: Bilingual;
    description: Bilingual;
    ogImage: string;
  };
};

export const defaultContent: SiteContent = {
  hero: {
    title: { en: "Bit Bladi", ar: "بيت بلدي" },
    subtitle: {
      en: "Authentic South Sudanese cuisine, delivered to your door.",
      ar: "المطبخ السوداني الجنوبي الأصيل، يُوصَّل إلى باب منزلك.",
    },
    ctaLabel: { en: "Order Now", ar: "اطلب الآن" },
    images: [
      "/uploads/hero-1.jpg",
      "/uploads/hero-2.jpg",
      "/uploads/hero-3.jpg",
      "/uploads/hero-4.jpg",
    ],
  },
  about: {
    heading: { en: "About Us", ar: "من نحن" },
    body: {
      en: "Welcome to Bit Bladi, your home for authentic South Sudanese cuisine in the heart of Nairobi. At Shujah Mall, Kilimani — first floor, opposite Adlife Plaza — we bring the rich flavors and traditions of South Sudan to your table.",
      ar: "مرحبًا بكم في بيت بلدي، موطن المأكولات السودانية الجنوبية الأصيلة في قلب نيروبي. في شجاع مول، كيليماني — الطابق الأول، مقابل أدلايف بلازا — نقدّم لكم نكهات وتقاليد جنوب السودان الغنية إلى مائدتكم.",
    },
  },
  whyUs: {
    heading: { en: "Why Choose Us", ar: "لماذا تختارنا" },
    items: [
      {
        title: { en: "Authentic Taste", ar: "الطعم الأصيل" },
        body: {
          en: "Traditional recipes passed down through generations.",
          ar: "وصفات تقليدية موروثة عبر الأجيال.",
        },
      },
      {
        title: { en: "Fresh Ingredients", ar: "مكونات طازجة" },
        body: {
          en: "Only the freshest ingredients in every dish.",
          ar: "نستخدم أجود المكونات الطازجة في كل طبق.",
        },
      },
      {
        title: { en: "Warm Hospitality", ar: "ضيافة دافئة" },
        body: {
          en: "Experience genuine South Sudanese warmth.",
          ar: "استمتع بدفء الضيافة السودانية الجنوبية الأصيلة.",
        },
      },
      {
        title: { en: "Fast Delivery", ar: "توصيل سريع" },
        body: {
          en: "Order on WhatsApp and we bring it to you.",
          ar: "اطلب عبر واتساب ونوصله إليك.",
        },
      },
    ],
  },
  delivery: {
    heading: { en: "Delivery", ar: "التوصيل" },
    body: {
      en: "We deliver across Kilimani and nearby areas. Place your order and our team will confirm delivery on WhatsApp.",
      ar: "نوصّل في كيليماني والمناطق المجاورة. قدّم طلبك وسيؤكد فريقنا التوصيل عبر واتساب.",
    },
    etaMinutes: "30–45",
    fee: { en: "Calculated on confirmation", ar: "يُحتسب عند التأكيد" },
  },
  contact: {
    phone: "0798022831",
    whatsapp: "254798022831",
    email: "bitbladi@gmail.com",
    address: {
      en: "Shujah Mall, Kilimani, First Floor — Opposite Adlife Plaza",
      ar: "شجاع مول، كيليماني، الطابق الأول — مقابل أدلايف بلازا",
    },
    hours: { en: "Daily 10:00 – 22:00", ar: "يوميًا ١٠:٠٠ – ٢٢:٠٠" },
    mapLat: -1.29469,
    mapLng: 36.78794,
    plusCode: "",
    mapQuery: "Shujah Mall, Kilimani, Nairobi",
  },
  social: { instagram: "", facebook: "", tiktok: "" },
  footer: {
    tagline: {
      en: "Authentic South Sudanese cuisine.",
      ar: "المطبخ السوداني الجنوبي الأصيل.",
    },
    copyright: {
      en: "© 2026 Bit Bladi. All rights reserved.",
      ar: "© ٢٠٢٦ بيت بلدي. جميع الحقوق محفوظة.",
    },
  },
  seo: {
    title: {
      en: "Bit Bladi — Authentic South Sudanese Food, Delivered",
      ar: "بيت بلدي — مأكولات سودانية جنوبية أصيلة، تُوصَّل إليك",
    },
    description: {
      en: "Order authentic South Sudanese dishes in Nairobi. Browse the menu and order on WhatsApp.",
      ar: "اطلب أطباقًا سودانية جنوبية أصيلة في نيروبي. تصفح القائمة واطلب عبر واتساب.",
    },
    ogImage: "/uploads/hero-1.jpg",
  },
};

// Deep-merge stored content over defaults so missing keys never break rendering.
export function mergeContent(stored: unknown): SiteContent {
  if (!stored || typeof stored !== "object") return defaultContent;
  const s = stored as Record<string, unknown>;
  const merge = <T,>(def: T, val: unknown): T => {
    if (val === null || val === undefined) return def;
    if (Array.isArray(def)) return (Array.isArray(val) ? val : def) as T;
    if (typeof def === "object") {
      const out: Record<string, unknown> = { ...(def as Record<string, unknown>) };
      const v = val as Record<string, unknown>;
      for (const k of Object.keys(out)) out[k] = merge(out[k], v?.[k]);
      return out as T;
    }
    return (val as T) ?? def;
  };
  return merge(defaultContent, s);
}
