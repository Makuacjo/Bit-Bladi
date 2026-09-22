import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { locales, getDict, type Lang } from "@/lib/i18n";
import { getSettings, orderConfig } from "@/lib/data";
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
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: content.seo.ogImage ? [content.seo.ogImage] : undefined,
      locale: l === "ar" ? "ar" : "en",
    },
    alternates: { languages: { en: "/en", ar: "/ar" } },
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
