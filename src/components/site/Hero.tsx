"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDict, type Lang } from "@/lib/i18n";
import type { SiteContent } from "@/lib/content";

export function Hero({
  content,
  lang,
}: {
  content: SiteContent;
  lang: Lang;
}) {
  const d = getDict(lang);
  const images = content.hero.images.filter(Boolean);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reduced, setReduced] = useState(false);
  const rtl = lang === "ar";

  // Respect the user's reduced-motion preference: no auto-rotation, no scale.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const autoplay = images.length > 1 && !paused && !interacting && !reduced;

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [autoplay, images.length]);

  // Clamp during render so a shrunk CMS image list can't point past the array.
  const safeIdx = idx < images.length ? idx : 0;

  const goTo = (i: number) => {
    setIdx(i);
    setPaused(true); // an explicit choice takes control from the autoplay
  };

  const hasCarousel = images.length > 1;
  const d2 = d.home;

  return (
    <section
      className="relative flex min-h-[86vh] items-center overflow-hidden bg-ink"
      aria-label={lang === "ar" ? "أطباق بيت بلدي" : "Bit Bladi signature dishes"}
      aria-roledescription={hasCarousel ? (rtl ? "دوّار صور" : "carousel") : undefined}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={() => setInteracting(false)}
    >
      <div className="absolute inset-0 bg-ink" aria-hidden="true">
        <AnimatePresence>
          {images.length > 0 && (
            <motion.div
              key={safeIdx}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: reduced ? 1 : 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 1.2, ease: "easeInOut" }}
            >
              <Image
                src={images[safeIdx]}
                alt=""
                fill
                preload={safeIdx === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Scrim on the text side keeps the headline readable over light photos while
            leaving the food (composed on the opposite side) bright. */}
        <div
          className={`absolute inset-0 ${
            rtl
              ? "bg-gradient-to-l from-ink/85 via-ink/45 to-transparent"
              : "bg-gradient-to-r from-ink/85 via-ink/45 to-transparent"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent" />
      </div>

      <div className="container-x relative z-10 py-28 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="eyebrow mb-4 text-gold">{d2.heroEyebrow}</p>
          <h1 className="tracking-hero font-display text-5xl font-bold leading-[1.03] text-cream [overflow-wrap:anywhere] sm:text-6xl md:text-7xl">
            {d2.heroTitle1}
            <br />
            <span className="text-gold">{d2.heroTitle2}</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-cream/85">{d2.heroDesc}</p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Link href={`/${lang}/menu`} className="btn btn-accent text-base">
              {d2.orderNow}
              <ArrowRight />
            </Link>
            <Link
              href={`/${lang}/menu`}
              className="group inline-flex items-center gap-2 text-base font-medium text-cream underline-offset-8 hover:text-gold"
            >
              <span className="border-b border-cream/40 pb-1 transition-colors group-hover:border-gold">
                {d2.exploreMenu}
              </span>
            </Link>
          </div>
        </motion.div>
      </div>

      {hasCarousel && (
        <div className="container-x pointer-events-none absolute inset-x-0 bottom-6 z-10">
          <div className="pointer-events-auto flex items-center gap-3">
            <div className="flex items-center gap-2" role="tablist" aria-label={rtl ? "شرائح الصور" : "Hero slides"}>
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === safeIdx}
                  aria-label={
                    rtl ? `عرض الصورة ${i + 1} من ${images.length}` : `Show image ${i + 1} of ${images.length}`
                  }
                  onClick={() => goTo(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === safeIdx ? "w-6 bg-cream" : "w-2.5 bg-cream/40 hover:bg-cream/70"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              aria-label={
                paused
                  ? rtl
                    ? "تشغيل عرض الصور"
                    : "Play slideshow"
                  : rtl
                    ? "إيقاف عرض الصور"
                    : "Pause slideshow"
              }
              className="grid size-8 place-items-center rounded-full bg-ink/40 text-cream backdrop-blur-sm transition-colors hover:bg-ink/60"
            >
              {paused ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 ms-0.5" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
                  <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function ArrowRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ms-0.5 rtl:rotate-180" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
