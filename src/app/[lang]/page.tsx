import { getDict, type Lang } from "@/lib/i18n";
import { getSettings, getMenu, getCategories } from "@/lib/data";
import { Hero } from "@/components/site/Hero";
import {
  FeatureStrip,
  Featured,
  Categories,
  About,
  FinalCTA,
} from "@/components/site/HomeSections";
import { MapSection } from "@/components/site/MapSection";
import { Reviews } from "@/components/site/Reviews";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const dict = getDict(l);
  const [settings, menu, categories] = await Promise.all([
    getSettings(),
    getMenu(),
    getCategories(),
  ]);

  const featured = menu.filter((m) => m.featured);
  const popular = menu.filter((m) => m.popular);
  const spotlight = (featured.length ? featured : popular.length ? popular : menu).slice(0, 3);

  const c = settings.content;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: settings.businessName,
    servesCuisine: "South Sudanese",
    priceRange: "$$",
    telephone: c.contact.phone,
    email: c.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: c.contact.address.en,
      addressLocality: "Nairobi",
      addressCountry: "KE",
    },
    image: c.hero.images[0],
    description: c.seo.description.en,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero content={settings.content} lang={l} />
      <FeatureStrip lang={l} />
      <Featured items={spotlight} lang={l} dict={dict} />
      <About lang={l} />
      <Categories categories={categories} items={menu} lang={l} dict={dict} />
      <Reviews lang={l} />
      <MapSection
        dict={dict}
        name={settings.businessName}
        addressLine={l === "ar" ? c.contact.address.ar : c.contact.address.en}
        query={c.contact.mapQuery}
        phone={c.contact.phone}
        hours={l === "ar" ? c.contact.hours.ar : c.contact.hours.en}
      />
      <FinalCTA lang={l} />
    </>
  );
}
