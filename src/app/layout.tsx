import type { Metadata } from "next";
import { headers } from "next/headers";
import { Playfair_Display, Hanken_Grotesk, Tajawal } from "next/font/google";
import "./globals.css";
import { isRtl, type Lang } from "@/lib/i18n";

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
  title: "Bit Bladi — Authentic South Sudanese Food, Delivered",
  description:
    "Order authentic South Sudanese dishes in Nairobi. Browse the menu and order on WhatsApp.",
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
