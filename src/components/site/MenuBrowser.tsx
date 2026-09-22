"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FoodCard } from "./FoodCard";
import type { MenuCategory, MenuItem } from "@/lib/types";
import type { Lang, Dict } from "@/lib/i18n";

export function MenuBrowser({
  items,
  categories,
  lang,
  dict,
  currency,
}: {
  items: MenuItem[];
  categories: MenuCategory[];
  lang: Lang;
  dict: Dict;
  currency: string;
}) {
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");

  const tabs = [
    { slug: "all", label: dict.menu.all },
    { slug: "popular", label: dict.menu.popular },
    ...categories.map((c) => ({ slug: c.slug, label: lang === "ar" ? c.nameAr : c.nameEn })),
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const inCat =
        active === "all" ? true : active === "popular" ? it.popular : it.categorySlug === active;
      if (!inCat) return false;
      if (!q) return true;
      return (
        it.nameEn.toLowerCase().includes(q) ||
        it.nameAr.toLowerCase().includes(q) ||
        it.descEn.toLowerCase().includes(q)
      );
    });
  }, [items, active, query]);

  return (
    <div>
      <h2 className="sr-only">{dict.menu.title}</h2>
      <div className="sticky top-16 z-30 -mx-5 bg-cream/90 px-5 py-3 backdrop-blur md:top-20">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="hide-scrollbar flex gap-2 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.slug}
                onClick={() => setActive(t.slug)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active === t.slug
                    ? "bg-ink text-cream"
                    : "border border-line bg-surface text-ink-soft hover:border-accent"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative md:w-64">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dict.menu.search}
              className="field-input pe-9"
              aria-label={dict.menu.search}
            />
            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-ink-soft">{dict.menu.noResults}</p>
      ) : (
        <motion.div layout className="mt-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
              >
                <FoodCard item={item} lang={lang} dict={dict} currency={currency} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
