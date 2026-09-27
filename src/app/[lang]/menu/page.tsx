import type { Metadata } from "next";
import { getDict, type Lang } from "@/lib/i18n";
import { getSettings, getMenu, getCategories } from "@/lib/data";
import { MenuBrowser } from "@/components/site/MenuBrowser";
import { JsonLd } from "@/components/site/JsonLd";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { pageMetadata, menuJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const l = (lang as Lang) || "en";
  const ar = l === "ar";
  return pageMetadata({
    lang: l,
    path: "/menu",
    title: ar ? "قائمة الطعام | بيت بلدي" : "Menu — South Sudanese Food & Grills",
    description: ar
      ? "تصفّح قائمة بيت بلدي: أطباق سودانية جنوبية أصيلة، مشاوي، حساء، فول والمزيد في كيليماني، نيروبي. اطلب عبر واتساب."
      : "Browse the Bit Bladi menu — authentic South Sudanese dishes, grills, soups, Ful and more in Kilimani, Nairobi. Order on WhatsApp.",
  });
}

export default async function MenuPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const dict = getDict(l);
  const [settings, menu, categories] = await Promise.all([
    getSettings(),
    getMenu(),
    getCategories(),
  ]);

  return (
    <div className="container-x pb-16 pt-24">
      <JsonLd
        data={[
          menuJsonLd(menu, categories, l, settings.currency),
          breadcrumbJsonLd([
            { name: l === "ar" ? "الرئيسية" : "Home", path: `/${l}` },
            { name: dict.menu.title, path: `/${l}/menu` },
          ]),
        ]}
      />
      <header className="mb-6">
        <Breadcrumbs
          lang={l}
          items={[
            { name: l === "ar" ? "الرئيسية" : "Home", path: `/${l}` },
            { name: dict.menu.title },
          ]}
        />
        <h1 className="mt-3 font-display text-4xl font-bold text-ink md:text-5xl">{dict.menu.title}</h1>
        <p className="mt-2 text-ink-soft">
          {l === "ar" ? settings.content.hero.subtitle.ar : settings.content.hero.subtitle.en}
        </p>
      </header>
      <MenuBrowser
        items={menu}
        categories={categories}
        lang={l}
        dict={dict}
        currency={settings.currency}
      />
    </div>
  );
}
