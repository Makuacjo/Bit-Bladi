import type { Metadata } from "next";
import { headers } from "next/headers";
import { Playfair_Display, Hanken_Grotesk, Tajawal } from "next/font/google";
import "./globals.css";
import { isRtl, type Lang } from "@/lib/i18n";
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});
const tajawal = Tajawal({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  // metadataBase makes every relative OG/canonical URL resolve to the canonical
  // production domain (never the temporary Hostinger preview host).
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bit Bladi | South Sudanese Restaurant & Food in Nairobi",
    template: "%s · Bit Bladi",
  },
  description:
    "Bit Bladi is a South Sudanese restaurant in Kilimani, Nairobi serving authentic, traditional South Sudanese and African food. Browse the menu and order on WhatsApp.",
  applicationName: "Bit Bladi",
  // Google Search Console domain/URL-prefix verification. Emits
  // <meta name="google-site-verification" ...> into the global <head>,
  // inherited by every public page (incl. the homepage).
  verification: {
    google: "pVbWxLdRb7-HLkR1mLLcTPlukWm_f-jDziu_SfyO5Xo",
  },
  keywords: [
    "Bit Bladi",
    "South Sudanese restaurant Nairobi",
    "South Sudanese food",
    "South Sudanese restaurant Kilimani",
    "African restaurant Nairobi",
    "Kisra",
    "Ful",
    "traditional South Sudanese food",
  ],
  openGraph: {
    type: "website",
    siteName: "Bit Bladi",
    url: `${SITE_URL}/en`,
    title: "Bit Bladi | South Sudanese Restaurant & Food in Nairobi",
    description:
      "Authentic South Sudanese cuisine in Kilimani, Nairobi — traditional dishes, grills and more. Browse the menu and order on WhatsApp.",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bit Bladi | South Sudanese Restaurant & Food in Nairobi",
    description:
      "Authentic South Sudanese cuisine in Kilimani, Nairobi. Browse the menu and order on WhatsApp.",
    images: [DEFAULT_OG_IMAGE],
  },
  // Official Bit Bladi brand icons. `app/favicon.ico` auto-emits the .ico link
  // (sizes="any"); these add the PNG tab icons, the iOS home-screen icon, and
  // the PWA manifest (Android/Chrome install icons). Inherited by /en, /ar, /admin.
  icons: {
    icon: [
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware sets x-lang from the URL so the root <html> gets correct lang/dir.
  const h = await headers();
  const lang = (h.get("x-lang") as Lang) || "en";
  const dir = isRtl(lang) ? "rtl" : "ltr";

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${playfair.variable} ${hanken.variable} ${tajawal.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
