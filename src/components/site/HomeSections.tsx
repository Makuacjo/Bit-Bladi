import Link from "next/link";
import { Reveal } from "./Reveal";
import { ScrollLink } from "./ScrollLink";
import { getDict, type Lang, type Dict } from "@/lib/i18n";
import type { SiteContent } from "@/lib/content";
import type { MenuCategory, MenuItem } from "@/lib/types";

type T = <V extends { en: string; ar: string }>(v: V) => string;
const tr = (lang: Lang): T => (v) => (lang === "ar" ? v.ar : v.en);

function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}
function ArrowRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ms-0.5 rtl:rotate-180" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Dark value strip directly below the hero — four gold-iconed pillars.
export function FeatureStrip({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const f = d.home.features;
  const items = [
    { icon: <IconLeaf />, ...f.fresh },
    { icon: <IconChef />, ...f.authentic },
    { icon: <IconHeart />, ...f.hospitality },
    { icon: <IconCutlery />, ...f.experience },
  ];
  return (
    <section className="bg-brown text-cream">
      <div className="container-x grid grid-cols-2 gap-y-8 py-9 md:grid-cols-4 md:gap-0">
        {items.map((it, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-2 md:px-6 ${i > 0 ? "md:border-s md:border-cream/12" : ""}`}
          >
            <span className="text-gold">{it.icon}</span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-cream">{it.title}</span>
              <span className="text-xs text-cream/60">{it.body}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// Featured / Signature Flavors — editorial left column + real dish cards.
export function Featured({
  items,
  lang,
  dict,
}: {
  items: MenuItem[];
  lang: Lang;
  dict: Dict;
  currency?: string;
}) {
  if (items.length === 0) return null;
  const t = tr(lang);
  const shown = items.slice(0, 3);
  return (
    <section className="bg-light-cream py-20 md:py-24">
      <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,19rem)_1fr] lg:items-center lg:gap-14">
        <Reveal>
          <div>
            <Eyebrow>{dict.home.featuredEyebrow}</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-bold text-ink md:text-5xl">{dict.home.featuredHeading}</h2>
            <p className="mt-4 max-w-sm leading-relaxed text-ink-soft">{dict.home.featuredDesc}</p>
            <Link href={`/${lang}/menu`} className="btn btn-outline mt-7 text-sm text-ink">
              {dict.home.viewFullMenu}
              <ArrowRight />
            </Link>
          </div>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-3">
          {shown.map((item, i) => {
            const name = t({ en: item.nameEn, ar: item.nameAr });
            const desc = t({ en: item.descEn, ar: item.descAr });
            return (
              <Reveal key={item.id} delay={i * 0.08}>
                <Link href={`/${lang}/menu`} className="group block">
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-sand shadow-soft ring-1 ring-line/60">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-display text-3xl text-muted/40">{name.charAt(0)}</div>
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-ink">{name}</h3>
                  {desc && <p className="mt-1 line-clamp-1 text-sm text-muted">{desc}</p>}
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Menu preview — real categories as image cards (image drawn from a dish in
// that category; category model has no image of its own).
export function Categories({
  categories,
  items = [],
  lang,
  dict,
}: {
  categories: MenuCategory[];
  items?: MenuItem[];
  lang: Lang;
  dict: Dict;
}) {
  if (categories.length === 0) return null;
  const dishWord = lang === "ar" ? "طبق" : "dishes";
  const shown = categories.slice(0, 4);
  return (
    <section id="menu" className="scroll-mt-24 bg-light-cream py-20 md:py-24">
      <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,19rem)_1fr] lg:items-center lg:gap-14">
        <Reveal>
          <div>
            <Eyebrow>{dict.home.menuEyebrow}</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-bold text-ink md:text-5xl">{dict.home.menuHeading}</h2>
            <p className="mt-4 max-w-sm leading-relaxed text-ink-soft">{dict.home.menuDesc}</p>
            <Link href={`/${lang}/menu`} className="btn btn-outline mt-7 text-sm text-ink">
              {dict.home.viewFullMenu}
              <ArrowRight />
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {shown.map((c, i) => {
            const name = lang === "ar" ? c.nameAr : c.nameEn;
            const inCat = items.filter((it) => it.categorySlug === c.slug);
            const img = inCat.find((it) => it.image)?.image;
            return (
              <Reveal key={c.id} delay={i * 0.06}>
                <Link href={`/${lang}/menu#${c.slug}`} className="group block">
                  <div className="aspect-square overflow-hidden rounded-2xl bg-sand shadow-soft ring-1 ring-line/60">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-display text-3xl text-muted/40">{name.charAt(0)}</div>
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold text-ink">{name}</h3>
                  <p className="mt-0.5 text-sm text-muted">
                    <span className="tnum">{inCat.length}</span> {dishWord}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// About — dark story panel, text left + existing photo right (no new asset).
export function About({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  return (
    <section id="about" className="scroll-mt-24 overflow-hidden bg-brown text-cream">
      <div className="grid items-stretch lg:grid-cols-2">
        <div className="flex items-center px-6 py-16 sm:px-10 md:py-20 lg:ps-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pe-16">
          <Reveal>
            <div className="max-w-lg">
              <Eyebrow>{d.home.storyEyebrow}</Eyebrow>
              <h2 className="mt-3 font-display text-4xl font-bold text-cream md:text-5xl">{d.home.storyHeading}</h2>
              <p className="mt-5 leading-relaxed text-cream/80">{d.home.storyBody}</p>
              <ScrollLink href={`/${lang}#menu`} className="btn btn-outline mt-8 text-sm text-cream">
                {d.home.learnMore}
                <ArrowRight />
              </ScrollLink>
            </div>
          </Reveal>
        </div>
        <div className="relative min-h-[16rem] lg:min-h-full">
          {/* Reuses an existing image asset — not replaced or edited. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/uploads/hero-2.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-brown/60 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}

export function Delivery({ content, lang }: { content: SiteContent; lang: Lang }) {
  const t = tr(lang);
  const d = getDict(lang);
  return (
    <section id="delivery" className="scroll-mt-24 bg-ink py-20 text-cream">
      <div className="container-x grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">{t(content.delivery.heading)}</h2>
            <p className="mt-4 max-w-lg leading-relaxed text-cream/85">{t(content.delivery.body)}</p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-cream/15 bg-cream/5 p-6">
            <div className="flex items-baseline justify-between border-b border-cream/15 pb-3">
              <span className="text-cream/70">{d.home.deliveryTime}</span>
              <span className="font-display text-2xl font-bold">
                <span className="tnum">{content.delivery.etaMinutes}</span> {d.home.minutes}
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-3">
              <span className="text-cream/70">{d.home.deliveryFee}</span>
              <span className="font-medium">{t(content.delivery.fee)}</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Promotions({
  items,
  lang,
}: {
  items: { id: string; titleEn: string; titleAr: string; descEn: string; descAr: string; image: string }[];
  lang: Lang;
}) {
  if (items.length === 0) return null;
  const d = getDict(lang);
  const name = (v: { en: string; ar: string }) => (lang === "ar" ? v.ar : v.en);
  return (
    <section className="container-x py-16">
      <div className="grid gap-5 md:grid-cols-2">
        {items.slice(0, 2).map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08}>
            <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
              {p.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image}
                  alt={name({ en: p.titleEn, ar: p.titleAr })}
                  className="h-48 w-full object-cover"
                />
              )}
              <div className="p-6">
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  {d.home.specialOffer}
                </span>
                <h3 className="mt-3 font-display text-2xl font-bold text-ink">
                  {name({ en: p.titleEn, ar: p.titleAr })}
                </h3>
                <p className="mt-2 text-ink-soft">{name({ en: p.descEn, ar: p.descAr })}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function IconLeaf() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 8-4 12-9 12Z" />
      <path d="M4 20c2-4 5-7 9-9" />
    </svg>
  );
}
function IconChef() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
      <path d="M6 14a4 4 0 0 1-1-7.9A4.5 4.5 0 0 1 12 4a4.5 4.5 0 0 1 7 2.1A4 4 0 0 1 18 14Z" />
      <path d="M6 14v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}
function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
      <path d="M12 20s-7-4.5-9.3-9A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 9.3 5C19 15.5 12 20 12 20Z" />
    </svg>
  );
}
function IconCutlery() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
      <path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M16 3c-1.5 0-3 1.5-3 4s1.5 4 3 4m0-8v18" />
    </svg>
  );
}
function IconBrowse() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}
function IconBag() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
      <path d="M6 8h12l-1 11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}
function IconSend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
      <path d="M5 12 20 4l-5 16-4-6-6-2Z" />
      <path d="M11 14 20 4" />
    </svg>
  );
}

export function HowItWorks({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const steps = [
    { icon: <IconBrowse />, title: d.home.step1Title, body: d.home.step1Body },
    { icon: <IconBag />, title: d.home.step2Title, body: d.home.step2Body },
    { icon: <IconSend />, title: d.home.step3Title, body: d.home.step3Body, accent: true },
  ];
  return (
    <section className="border-y border-line bg-surface py-16">
      <div className="container-x">
        <Reveal>
          <h2 className="mb-10 text-center font-display text-3xl font-bold text-ink md:text-4xl">
            {d.home.howHeading}
          </h2>
        </Reveal>
        <ol className="flex flex-col gap-8 md:flex-row md:items-start md:gap-2">
          {steps.map((s, i) => (
            <li key={i} className="flex flex-1 flex-col md:flex-row md:items-start md:gap-2">
              <Reveal delay={i * 0.08} className="flex flex-1 flex-col items-center gap-3 px-2 text-center">
                <span
                  className={`grid size-14 place-items-center rounded-full ${
                    s.accent ? "bg-accent text-white" : "bg-accent/10 text-accent"
                  }`}
                >
                  {s.icon}
                </span>
                <h3 className="font-display text-lg font-semibold text-ink">{s.title}</h3>
                <p className="max-w-[26ch] text-sm leading-relaxed text-ink-soft">{s.body}</p>
              </Reveal>
              {i < steps.length - 1 && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="mt-6 hidden size-6 shrink-0 self-center text-muted rtl:rotate-180 md:block"
                >
                  <path d="m9 6 6 6-6 6" />
                </svg>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function FinalCTA({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  return (
    <section className="container-x py-10">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-brown px-8 py-14 text-center text-cream">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold md:text-4xl">{d.home.finalHeading}</h2>
            <p className="mx-auto mt-3 max-w-xl text-cream/85">{d.home.finalBody}</p>
            <Link href={`/${lang}/menu`} className="btn btn-accent mt-6 px-7 py-3 text-base">
              {d.home.finalCta}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
