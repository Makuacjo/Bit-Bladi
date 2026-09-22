import { Reveal } from "./Reveal";
import { Stars } from "./Stars";
import { ReviewCarousel } from "./ReviewCarousel";
import { ReviewDialog } from "./ReviewDialog";
import { getApprovedReviews, getReviewStats } from "@/lib/reviews";
import { getDict, type Lang } from "@/lib/i18n";

const MAX = 12; // reviews loaded into the carousel

export async function Reviews({ lang }: { lang: Lang }) {
  const dict = getDict(lang);
  const r = dict.reviews;
  const [{ reviews }, stats] = await Promise.all([
    getApprovedReviews({ page: 1, perPage: MAX }),
    getReviewStats(),
  ]);

  const nf = new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-US");
  const reviewsLabel = stats.total === 1 ? r.reviewWord : r.reviewsWord;
  const hasReviews = stats.total > 0;

  return (
    <section id="reviews" className="relative scroll-mt-24 overflow-hidden bg-ink py-20 text-cream md:py-24">
      {/* subtle warm depth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brown/40 via-transparent to-brown/40" />
      <div className="pointer-events-none absolute -start-24 top-10 h-72 w-72 rounded-full bg-gold/5 blur-3xl" />
      <div className="pointer-events-none absolute -end-24 bottom-10 h-72 w-72 rounded-full bg-gold/5 blur-3xl" />

      <div className="container-x relative">
        {/* Header */}
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-gold/50" />
              <span className="eyebrow">{r.eyebrow}</span>
              <span className="h-px w-10 bg-gold/50" />
            </div>
            <h2 className="font-display text-4xl font-bold text-cream md:text-5xl">{r.title}</h2>
            <p className="mt-3 text-cream/70">{r.subtitle}</p>
            <div className="mt-7 flex justify-center">
              <ReviewDialog lang={lang} dict={dict} variant="solid" />
            </div>
          </div>
        </Reveal>

        {hasReviews ? (
          <div className="mt-12 grid items-center gap-8 lg:grid-cols-[20rem_1fr] lg:gap-6">
            {/* Rating summary panel */}
            <Reveal>
              <div className="rounded-3xl border border-gold/15 bg-brown-warm/40 p-6">
                <div className="flex items-center gap-4">
                  <div className="tnum font-display text-5xl font-bold leading-none text-cream">{nf.format(stats.average)}</div>
                  <div>
                    <Stars value={stats.average} size={18} />
                    <p className="mt-1.5 text-sm text-cream/60">
                      {r.basedOn} {nf.format(stats.total)} {reviewsLabel}
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  {([5, 4, 3, 2, 1] as const).map((star) => {
                    const count = stats.breakdown[star];
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-2.5 text-sm">
                        <span className="tnum flex w-7 items-center gap-1 text-cream/70">
                          {star}
                          <svg width="11" height="11" viewBox="0 0 24 24" className="text-gold" fill="currentColor" aria-hidden="true">
                            <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.9l-5.81 3.06 1.11-6.47L2.6 9.9l6.5-.95L12 2.5z" />
                          </svg>
                        </span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream/10">
                          <span className="block h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                        </span>
                        <span className="tnum w-5 text-end text-cream/60">{nf.format(count)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            {/* Carousel */}
            <Reveal delay={0.1}>
              <ReviewCarousel reviews={reviews} lang={lang} dict={dict} />
            </Reveal>
          </div>
        ) : (
          <Reveal delay={0.1}>
            <div className="mx-auto mt-12 max-w-xl rounded-3xl border border-dashed border-cream/20 bg-cream/5 p-10 text-center">
              <p className="text-lg text-cream/80">{r.none}</p>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
