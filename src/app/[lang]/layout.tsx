import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { locales, getDict, type Lang } from "@/lib/i18n";
import { getSettings, orderConfig } from "@/lib/data";
import { buildAlternates, ogLocale, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { ScrollReset } from "@/components/site/ScrollReset";

// Public content is CMS-driven; render dynamically so admin edits reflect immediately.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const l = (lang as Lang) || "en";
  const { content } = await getSettings();
  const title = l === "ar" ? content.seo.title.ar : content.seo.title.en;
  const description = l === "ar" ? content.seo.description.ar : content.seo.description.en;
  const ogImage = content.seo.ogImage || DEFAULT_OG_IMAGE;
  // Home is served by this layout + [lang]/page.tsx, so the canonical/hreflang
  // here describe the home route (""). Child routes (/menu, /reserve, /food/*,
  // /locations/*) export their own generateMetadata that overrides these.
  return {
    // `absolute` keeps the home title verbatim (no "· Bit Bladi" template suffix).
    title: { absolute: title },
    description,
    alternates: buildAlternates(l, ""),
    openGraph: {
      type: "website",
      siteName: "Bit Bladi",
      title,
      description,
      images: [{ url: ogImage }],
      locale: ogLocale(l),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!(locales as readonly string[]).includes(lang)) notFound();
  const l = lang as Lang;
  const dict = getDict(l);
  const settings = await getSettings();

  return (
    <>
      <ScrollReset />
      <Navbar lang={l} dict={dict} businessName={settings.businessName} />
      <main className="flex-1">{children}</main>
      <Footer lang={l} dict={dict} content={settings.content} businessName={settings.businessName} />
      <CartDrawer lang={l} dict={dict} config={orderConfig(settings)} />
    </>
  );
}
