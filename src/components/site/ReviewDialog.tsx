"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Dict, Lang } from "@/lib/i18n";

type Errors = { name?: string; rating?: string; text?: string; email?: string; general?: string };

export function ReviewDialog({
  lang,
  dict,
  variant = "solid",
  className = "",
}: {
  lang: Lang;
  dict: Dict;
  variant?: "solid" | "ghost" | "dark";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const btn =
    variant === "ghost"
      ? "btn btn-ghost text-sm"
      : variant === "dark"
        ? "btn btn-primary text-sm"
        : "btn btn-accent text-sm";
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${btn} ${className}`}>
        <PenIcon />
        {dict.reviews.write}
      </button>
      <AnimatePresence>
        {open && <Modal lang={lang} dict={dict} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function Modal({ lang, dict, onClose }: { lang: Lang; dict: Dict; onClose: () => void }) {
  const rtl = lang === "ar";
  const reduce = useReducedMotion();
  const r = dict.reviews;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function validate(): boolean {
    const e: Errors = {};
    if (!name.trim()) e.name = r.errors.name;
    if (rating < 1 || rating > 5) e.rating = r.errors.rating;
    if (!text.trim()) e.text = r.errors.text;
    else if (text.trim().length < 3) e.text = r.errors.textShort;
    else if (text.length > 1500) e.text = r.errors.textLong;
    if (email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) e.email = r.errors.email;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: name, rating, reviewText: text, email, website }),
      });
      if (res.status === 201) {
        setDone(true);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) setErrors({ general: r.errors.rateLimited });
      else if (res.status === 422) {
        const key = String(data.key || "failed");
        const map: Record<string, keyof Errors> = {
          name: "name",
          rating: "rating",
          textShort: "text",
          textLong: "text",
          email: "email",
        };
        const field = map[key];
        const msg = (r.errors as Record<string, string>)[key] || r.errors.failed;
        setErrors(field ? { [field]: msg } : { general: r.errors.failed });
      } else setErrors({ general: r.errors.failed });
    } catch {
      setErrors({ general: r.errors.failed });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[80] bg-ink/45 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[81] flex items-center justify-center overflow-y-auto p-4">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={r.form.title}
          dir={rtl ? "rtl" : "ltr"}
          className="my-8 w-full max-w-lg rounded-3xl bg-surface p-6 shadow-lift sm:p-8"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between">
            <h2 className="font-display text-2xl font-bold text-ink">{r.form.title}</h2>
            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink hover:border-accent"
              aria-label={dict.common.close}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {done ? (
            <div className="flex flex-col items-center gap-5 py-8 text-center">
              <motion.span
                initial={reduce ? {} : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </motion.span>
              <p className="max-w-sm leading-relaxed text-ink-soft">{r.success}</p>
              <button onClick={onClose} className="btn btn-accent text-sm">
                {dict.common.close}
              </button>
            </div>
          ) : (
            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              {/* Rating */}
              <div>
                <span className="field-label">{r.form.rating}</span>
                <div className="flex items-center gap-1.5" role="radiogroup" aria-label={r.form.rating}>
                  {[1, 2, 3, 4, 5].map((i) => {
                    const active = (hover || rating) >= i;
                    return (
                      <button
                        key={i}
                        type="button"
                        role="radio"
                        aria-checked={rating === i}
                        aria-label={`${i}`}
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(0)}
                        onFocus={() => setHover(i)}
                        onBlur={() => setHover(0)}
                        onClick={() => setRating(i)}
                        className={`grid h-11 w-11 place-items-center rounded-xl border transition-colors ${
                          active ? "border-accent bg-accent/10" : "border-line bg-surface hover:border-accent/50"
                        }`}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" className={active ? "text-accent" : "text-accent/25"} fill="currentColor" aria-hidden="true">
                          <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.9l-5.81 3.06 1.11-6.47L2.6 9.9l6.5-.95L12 2.5z" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1 text-xs text-muted">{r.form.ratingHint}</p>
                {errors.rating && <p className="mt-1 text-xs text-accent">{errors.rating}</p>}
              </div>

              {/* Name */}
              <label className="block">
                <span className="field-label">{r.form.name}</span>
                <input
                  className="field-input"
                  value={name}
                  maxLength={80}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={r.form.namePlaceholder}
                  autoComplete="name"
                />
                {errors.name && <span className="mt-1 block text-xs text-accent">{errors.name}</span>}
              </label>

              {/* Review text */}
              <label className="block">
                <span className="field-label">{r.form.text}</span>
                <textarea
                  className="field-input"
                  rows={4}
                  value={text}
                  maxLength={1500}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={r.form.textPlaceholder}
                />
                {errors.text && <span className="mt-1 block text-xs text-accent">{errors.text}</span>}
              </label>

              {/* Email (optional, private) */}
              <label className="block">
                <span className="field-label">{r.form.email}</span>
                <input
                  className="field-input"
                  type="email"
                  value={email}
                  maxLength={160}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={r.form.emailPlaceholder}
                  autoComplete="email"
                />
                {errors.email && <span className="mt-1 block text-xs text-accent">{errors.email}</span>}
              </label>

              {/* Honeypot — visually hidden, off the tab order. Bots fill it, humans don't. */}
              <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
                <label>
                  Website
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </label>
              </div>

              {errors.general && <p className="text-sm text-accent">{errors.general}</p>}

              <button type="submit" disabled={submitting} className="btn btn-accent w-full">
                {submitting ? r.form.submitting : r.form.submit}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </>
  );
}

function PenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
