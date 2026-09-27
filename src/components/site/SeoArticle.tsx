import Link from "next/link";
import { Breadcrumbs } from "./Breadcrumbs";
import type { Lang } from "@/lib/i18n";

export type ArticleSection = {
  heading: string;
  paras?: string[];
  bullets?: string[];
};

export type ArticleData = {
  eyebrow: string;
  title: string; // the single page H1
  intro: string;
  image?: { src: string; alt: string };
  sections: ArticleSection[];
  faqs?: { question: string; answer: string }[];
  ctas: { href: string; label: string; primary?: boolean }[];
  related?: { href: string; label: string }[];
  relatedHeading?: string;
  faqHeading?: string;
};

// Editorial content-page layout shared by the food + location SEO pages. Renders
// a keyword-focused H1, crawlable body copy (H2 sections, lists), an optional
// image, calls to action and an internal-links block.
export function SeoArticle({
  lang,
  breadcrumbs,
  data,
}: {
  lang: Lang;
  breadcrumbs: { name: string; path?: string }[];
  data: ArticleData;
}) {
  return (
    <article className="container-x max-w-3xl pb-20 pt-24">
      <Breadcrumbs lang={lang} items={breadcrumbs} />

      <header className="mt-4">
        <p className="eyebrow text-accent">{data.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink md:text-5xl">
          {data.title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">{data.intro}</p>
      </header>

      {data.image && (
        <div className="mt-8 overflow-hidden rounded-2xl shadow-soft ring-1 ring-line/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.image.src}
            alt={data.image.alt}
            loading="lazy"
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      )}

      <div className="mt-10 space-y-10">
        {data.sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">{s.heading}</h2>
            {s.paras?.map((p, j) => (
              <p key={j} className="mt-4 leading-relaxed text-ink-soft">
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul className="mt-4 list-disc space-y-2 ps-6 text-ink-soft">
                {s.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {data.faqs && data.faqs.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
            {data.faqHeading ?? (lang === "ar" ? "أسئلة شائعة" : "Frequently asked questions")}
          </h2>
          <dl className="mt-5 space-y-6">
            {data.faqs.map((f, i) => (
              <div key={i}>
                <dt className="font-display text-lg font-semibold text-ink">{f.question}</dt>
                <dd className="mt-2 leading-relaxed text-ink-soft">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <div className="mt-12 flex flex-wrap gap-4">
        {data.ctas.map((c, i) => (
          <Link
            key={i}
            href={c.href}
            className={`btn text-sm ${c.primary ? "btn-accent" : "btn-outline text-ink"}`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {data.related && data.related.length > 0 && (
        <nav className="mt-14 border-t border-line pt-8">
          <h2 className="font-display text-xl font-bold text-ink">
            {data.relatedHeading ?? (lang === "ar" ? "استكشف المزيد" : "Explore more")}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-accent">
            {data.related.map((r, i) => (
              <li key={i}>
                <Link href={r.href} className="hover:underline">
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </article>
  );
}
