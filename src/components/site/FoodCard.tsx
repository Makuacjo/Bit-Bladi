"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { localizedName, localizedDesc, type MenuItem } from "@/lib/types";
import type { Lang, Dict } from "@/lib/i18n";

export function FoodCard({
  item,
  lang,
  dict,
  currency,
}: {
  item: MenuItem;
  lang: Lang;
  dict: Dict;
  currency: string;
}) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  const name = localizedName(item, lang);
  const desc = localizedDesc(item, lang);

  function handleAdd() {
    if (!item.available) return;
    add(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group @container flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-soft"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-4xl font-bold text-muted/40">{name.charAt(0)}</span>
          </div>
        )}
        {item.popular && (
          <span className="absolute top-3 start-3 rounded-full bg-ink/85 px-2.5 py-1 text-xs font-semibold text-cream">
            {dict.menu.popular}
          </span>
        )}
        {!item.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-cream/65">
            <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cream">
              {dict.menu.soldOut}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-semibold leading-tight text-ink">{name}</h3>
        {desc && <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{desc}</p>}
        <div className="mt-auto flex flex-col gap-3 pt-4 @[14rem]:flex-row @[14rem]:items-center @[14rem]:justify-between @[14rem]:gap-2">
          <span className="tnum text-base font-semibold text-ink">{formatPrice(item.price, currency, lang)}</span>
          {item.available ? (
            <button
              onClick={handleAdd}
              className={`btn w-full justify-center whitespace-nowrap text-sm @[14rem]:w-auto ${added ? "btn-primary" : "btn-accent"} px-4 py-2`}
              aria-label={`${dict.cart.add}: ${name}`}
            >
              {added ? (
                <>
                  <CheckIcon /> {dict.cart.added}
                </>
              ) : (
                <>
                  <PlusIcon /> {dict.cart.add}
                </>
              )}
            </button>
          ) : (
            <button
              disabled
              className="btn w-full cursor-not-allowed justify-center whitespace-nowrap border border-line px-4 py-2 text-sm text-muted opacity-70 @[14rem]:w-auto"
              aria-label={`${dict.menu.soldOut}: ${name}`}
            >
              {dict.menu.soldOut}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
