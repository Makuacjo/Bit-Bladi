"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Dict, Lang } from "@/lib/i18n";

type Slot = { time: string; available: boolean; seatsLeft: number };
type Errors = Partial<Record<"name" | "phone" | "email" | "date" | "time" | "guests" | "general", string>>;

type Success = { code: string; date: string; time: string; guestCount: number };

export function ReservationForm({
  lang,
  dict,
  whatsapp,
  maxGuests = 12,
}: {
  lang: Lang;
  dict: Dict;
  whatsapp: string;
  maxGuests?: number;
}) {
  const r = dict.reserve;
  const reduce = useReducedMotion();
  const todayIso = new Date().toISOString().slice(0, 10);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [requests, setRequests] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Success | null>(null);

  // Fetch availability whenever date or guest count changes. All setState runs
  // after the awaited response, so nothing fires synchronously in the effect;
  // the loading flag + resets are handled by the change handlers below.
  useEffect(() => {
    if (!date) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/reservations/availability?date=${date}&guests=${guests}`, { cache: "no-store" });
        const data = await res.json();
        if (active) setSlots(Array.isArray(data.slots) ? data.slots : []);
      } catch {
        if (active) setSlots([]);
      } finally {
        if (active) setLoadingSlots(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [date, guests]);

  const pickDate = (v: string) => {
    setDate(v);
    setTime("");
    setSlots(null);
    setLoadingSlots(!!v);
  };
  const pickGuests = (n: number) => {
    setGuests(n);
    setTime("");
    if (date) setLoadingSlots(true);
  };

  function validate(): boolean {
    const e: Errors = {};
    if (!name.trim()) e.name = r.errors.name;
    if (!/^\+?[0-9\s().-]{7,24}$/.test(phone.trim())) e.phone = r.errors.phone;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) e.email = r.errors.email;
    if (!date) e.date = r.errors.date;
    if (!time) e.time = r.errors.time;
    if (guests < 1 || guests > maxGuests) e.guests = r.errors.guests;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          date,
          time,
          guestCount: guests,
          specialRequests: requests,
          preferredLanguage: lang,
          website,
        }),
      });
      if (res.status === 201) {
        const data = await res.json();
        setDone(data.reservation);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) setErrors({ general: r.errors.rateLimited });
      else if (res.status === 409) {
        setErrors({ time: r.errors.unavailable });
        // refresh slots so the taken time drops out
        setSlots(null);
        setTime("");
        const av = await fetch(`/api/reservations/availability?date=${date}&guests=${guests}`, { cache: "no-store" });
        const ad = await av.json().catch(() => ({ slots: [] }));
        setSlots(Array.isArray(ad.slots) ? ad.slots : []);
      } else if (res.status === 422) {
        const key = String(data.key || "failed");
        const field = (["name", "phone", "email", "date", "time", "guests"] as const).find((f) => key === f);
        setErrors(field ? { [field]: (r.errors as Record<string, string>)[key] || r.errors.failed } : { general: r.errors.failed });
      } else setErrors({ general: r.errors.failed });
    } catch {
      setErrors({ general: r.errors.failed });
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setDone(null);
    setName("");
    setPhone("");
    setEmail("");
    setDate("");
    setTime("");
    setGuests(2);
    setRequests("");
    setSlots(null);
    setErrors({});
  }

  if (done) {
    const waText = encodeURIComponent(
      `${r.success.ref}: ${done.code} — ${done.date} ${done.time} · ${done.guestCount} ${r.guestsUnit}`
    );
    const waUrl = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${waText}`;
    return (
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-xl rounded-3xl border border-line bg-surface p-8 text-center shadow-soft sm:p-10"
      >
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold text-ink">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold text-ink">{r.success.heading}</h2>
        <p className="mx-auto mt-2 max-w-md leading-relaxed text-ink-soft">{r.success.body}</p>

        <div className="mt-6 inline-flex flex-col items-center gap-1 rounded-2xl border border-gold/30 bg-gold/5 px-8 py-5">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{r.success.ref}</span>
          <span className="tnum font-display text-3xl font-bold tracking-wide text-ink">{done.code}</span>
          <span className="mt-1 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-[color:var(--color-gold)]">
            {r.success.pending}
          </span>
        </div>

        <div className="mt-5 text-sm text-ink-soft">
          <p className="font-medium text-ink">{formatDate(done.date, lang)} · {formatTime(done.time, lang)}</p>
          <p className="tnum mt-0.5 text-muted">{done.guestCount} {r.guestsUnit}</p>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a href={waUrl} target="_blank" rel="noreferrer" className="btn btn-accent text-sm">
            {r.success.whatsapp}
          </a>
          <button onClick={reset} className="btn btn-outline text-sm text-ink">
            {r.success.another}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="mx-auto max-w-2xl rounded-3xl border border-line bg-surface p-6 shadow-soft sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={r.name} error={errors.name}>
          <input className="field-input" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder={r.namePh} autoComplete="name" />
        </Field>
        <Field label={r.phone} error={errors.phone}>
          <input className="field-input" value={phone} maxLength={24} onChange={(e) => setPhone(e.target.value)} placeholder={r.phonePh} inputMode="tel" autoComplete="tel" />
        </Field>
        <Field label={r.email} error={errors.email} className="sm:col-span-2">
          <input className="field-input" type="email" value={email} maxLength={160} onChange={(e) => setEmail(e.target.value)} placeholder={r.emailPh} autoComplete="email" />
        </Field>
        <Field label={r.date} error={errors.date}>
          <input className="field-input" type="date" min={todayIso} value={date} onChange={(e) => pickDate(e.target.value)} />
        </Field>
        <Field label={r.guests} error={errors.guests}>
          <select className="field-input" value={guests} onChange={(e) => pickGuests(Number(e.target.value))}>
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} {r.guestsUnit}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Time slots */}
      <div className="mt-5">
        <span className="field-label">{r.time}</span>
        {!date ? (
          <p className="rounded-xl border border-dashed border-line px-4 py-4 text-sm text-muted">{r.selectDateFirst}</p>
        ) : loadingSlots ? (
          <p className="px-1 py-3 text-sm text-muted">{r.loadingSlots}</p>
        ) : slots && slots.length > 0 && slots.some((s) => s.available) ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((s) => {
              const active = time === s.time;
              return (
                <button
                  key={s.time}
                  type="button"
                  disabled={!s.available}
                  onClick={() => setTime(s.time)}
                  aria-pressed={active}
                  className={`rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-gold bg-gold text-ink"
                      : s.available
                        ? "border-line bg-white text-ink hover:border-gold"
                        : "cursor-not-allowed border-line/60 bg-sand/40 text-muted/50 line-through"
                  }`}
                >
                  {formatTime(s.time, lang)}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-line px-4 py-4 text-sm text-muted">{r.noSlots}</p>
        )}
        {errors.time && <p className="mt-1.5 text-xs text-accent">{errors.time}</p>}
      </div>

      <div className="mt-4">
        <Field label={`${r.requests} — ${r.requestsOptional}`}>
          <textarea className="field-input" rows={3} value={requests} maxLength={1000} onChange={(e) => setRequests(e.target.value)} placeholder={r.requestsPh} />
        </Field>
      </div>

      {/* Honeypot */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>

      {errors.general && <p className="mt-4 text-sm text-accent">{errors.general}</p>}

      <button type="submit" disabled={submitting} className="btn btn-accent mt-6 w-full py-3 text-base disabled:opacity-60">
        {submitting ? r.submitting : r.submit}
      </button>
    </motion.form>
  );
}

function Field({ label, error, children, className = "" }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-accent">{error}</span>}
    </label>
  );
}

function formatDate(date: string, lang: Lang) {
  try {
    return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${date}T00:00:00`));
  } catch {
    return date;
  }
}
function formatTime(time: string, lang: Lang) {
  if (lang === "ar") return time;
  const [h, m] = time.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${ap}`;
}
