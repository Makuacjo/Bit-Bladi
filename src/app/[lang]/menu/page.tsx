import { getDict, type Lang } from "@/lib/i18n";
import { getSettings, getMenu, getCategories } from "@/lib/data";
import { MenuBrowser } from "@/components/site/MenuBrowser";

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
      <header className="mb-6">
        <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">{dict.menu.title}</h1>
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
