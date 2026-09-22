"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Stars } from "./Stars";
import { formatReviewDate } from "@/lib/format";
import type { Dict, Lang } from "@/lib/i18n";
import type { PublicReview } from "@/lib/reviews";

const INTERVAL = 5000;

export function ReviewCarousel({
  reviews,
  lang,
  dict,
}: {
  reviews: PublicReview[];
  lang: Lang;
  dict: Dict;
}) {
  const rtl = lang === "ar";
  const reduce = useReducedMotion();
  const r = dict.reviews;
  const count = reviews.length;

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1); // 1 = forward, -1 = backward
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const pointerStart = useRef<number | null>(null);

  // Clamp in render so a shrinking list (a review deleted/rejected) can never
  // point past the array — no correcting effect / synchronous setState needed.
  const safeIndex = Math.min(index, Math.max(0, count - 1));

  const go = (next: number, direction: number) => {
    setDir(direction);
    setIndex(((next % count) + count) % count);
  };
  const next = () => go(safeIndex + 1, 1);
  const prev = () => go(safeIndex - 1, -1);

  // Pause when the tab is hidden. Listener is cleaned up on unmount.
  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const autoplay = count > 1 && !reduce && !hovering && !focusWithin && !tabHidden;

  // Single interval, recreated whenever `index` (manual nav) or gating changes,
  // so manual navigation resets the timer and there are never overlapping timers.
  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => clearInterval(id);
  }, [autoplay, count, index]);

  function onPointerDown(e: React.PointerEvent) {
    pointerStart.current = e.clientX;
  }
  function onPointerUp(e: React.PointerEvent) {
    if (pointerStart.current === null) return;
    const dx = e.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(dx) < 50) return;
    const forward = rtl ? dx > 0 : dx < 0; // swipe against reading direction = next
    if (count > 1) (forward ? next : prev)();
  }

  const active = reviews[safeIndex];
  const enterX = `${dir * (rtl ? -100 : 100)}%`;
  const exitX = `${-dir * (rtl ? -100 : 100)}%`;
  const transition = reduce
    ? { duration: 0 }
    : { x: { type: "tween" as const, ease: [0.22, 1, 0.36, 1] as const, duration: 0.55 }, opacity: { duration: 0.35 } };

  const single = count === 1;

  return (
    <div
      className="relative w-full"
      role="group"
      aria-roledescription="carousel"
      aria-label={r.title}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={() => setFocusWithin(false)}
    >
      {/* Arrows (hidden when only one review). Positioned with start/end so they
          flip automatically in RTL. */}
      {!single && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label={r.prev}
            className="absolute top-1/2 z-20 -translate-y-1/2 start-0 grid h-11 w-11 place-items-center rounded-full border border-gold/40 bg-ink/40 text-gold backdrop-blur transition-colors hover:border-gold hover:bg-gold/10 md:-start-3"
          >
            <Chevron dir="start" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={r.next}
            className="absolute top-1/2 z-20 -translate-y-1/2 end-0 grid h-11 w-11 place-items-center rounded-full border border-gold/40 bg-ink/40 text-gold backdrop-blur transition-colors hover:border-gold hover:bg-gold/10 md:-end-3"
          >
            <Chevron dir="end" />
          </button>
        </>
      )}

      {/* Card stage — fixed min-height + absolute card prevents layout jumps and
          keeps outgoing/incoming cards from pushing the page around. */}
      <div
        className="relative mx-auto min-h-[19rem] max-w-3xl px-2 sm:min-h-[17rem] sm:px-10"
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {/* Layered depth behind the active card */}
        <div aria-hidden="true" className="absolute inset-x-6 top-3 bottom-[-0.5rem] rounded-3xl bg-surface/60 shadow-soft" />
        <div aria-hidden="true" className="absolute inset-x-3 top-1.5 bottom-[-0.25rem] rounded-3xl bg-surface/80 shadow-soft" />

        <div className="relative overflow-hidden">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.figure
              key={active.id}
              custom={dir}
              initial={{ x: enterX, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: exitX, opacity: 0 }}
              transition={transition}
              className="relative w-full rounded-3xl border border-line bg-surface p-7 shadow-soft sm:p-9"
              aria-roledescription="slide"
              aria-label={`${safeIndex + 1} / ${count}`}
            >
              <QuoteMark className="pointer-events-none absolute end-6 top-5 text-5xl leading-none text-gold/25" />
              <div className="flex items-start gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent/10 font-display text-xl font-bold text-accent">
                  {active.customerName.trim().charAt(0).toUpperCase() || "★"}
                </span>
                <div className="min-w-0">
                  <figcaption className="font-display text-xl font-semibold text-ink">{active.customerName}</figcaption>
                  <div className="mt-1"><Stars value={active.rating} size={16} /></div>
                  <time className="mt-1 block text-xs text-muted" dateTime={active.createdAt}>
                    {formatReviewDate(active.createdAt, lang)}
                  </time>
                </div>
              </div>
              <blockquote className="mt-4 line-clamp-5 whitespace-pre-line font-display text-lg italic leading-relaxed text-ink-soft [overflow-wrap:anywhere]">
                {lang === "ar" ? `«${active.reviewText}»` : `“${active.reviewText}”`}
              </blockquote>
            </motion.figure>
          </AnimatePresence>
        </div>

        {/* Live region for screen readers */}
        <span className="sr-only" aria-live="polite">
          {active.customerName} — {active.rating}/5
        </span>
      </div>

      {/* Dots */}
      {!single && (
        <div className="mt-7 flex items-center justify-center gap-2.5">
          {reviews.map((rv, i) => (
            <button
              key={rv.id}
              type="button"
              onClick={() => go(i, i > safeIndex ? 1 : -1)}
              aria-label={`${r.goTo} ${i + 1}`}
              aria-current={i === safeIndex}
              className={`h-2.5 rounded-full transition-all ${
                i === safeIndex ? "w-6 bg-accent" : "w-2.5 bg-gold/30 hover:bg-gold/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Chevron({ dir }: { dir: "start" | "end" }) {
  // Points toward inline-start or inline-end; rtl:rotate handles mirroring.
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-5 ${dir === "start" ? "rotate-180" : ""} rtl:-scale-x-100`}
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function QuoteMark({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      &rdquo;
    </span>
  );
}
