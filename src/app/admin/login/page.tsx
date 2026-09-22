"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { loginAction } from "../actions";

export default function LoginPage() {
  const params = useSearchParams();
  const reduce = useReducedMotion();
  const [showPw, setShowPw] = useState(false);
  // Success navigation happens server-side in loginAction (redirect after the
  // cookie is set); the client only handles pending + error state here.
  const [state, action, pending] = useActionState(loginAction, null as null | { error?: string });

  const fadeUp = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex min-h-screen flex-col bg-light-cream lg:flex-row">
      {/* ── Left: brand + food collage (dark "Sofra After Dark" ground) ── */}
      <div className="relative hidden overflow-hidden bg-ink text-cream lg:flex lg:w-1/2">
        {/* warm depth + gold light pools */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brown/60 via-ink to-ink" />
        <div className="pointer-events-none absolute -start-24 top-1/4 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -end-16 bottom-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <LineArt className="pointer-events-none absolute -start-10 -top-8 h-72 w-72 text-gold/10" />
        <LineArt className="pointer-events-none absolute -end-12 -bottom-10 h-72 w-72 -scale-x-100 text-gold/10" />

        <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <LogoMark className="h-9 w-9 text-gold" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl font-bold text-cream">Bit Bladi</span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
                Taste of Home
              </span>
            </span>
          </div>

          {/* Layered food collage — existing dish photography, circular frames */}
          <motion.div
            className="relative mx-auto my-8 h-[22rem] w-[22rem] xl:h-[26rem] xl:w-[26rem]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduce ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <FoodCircle
              src="/uploads/dish-khodrah-mafrokah.jpg"
              className="absolute inset-x-0 top-0 mx-auto h-60 w-60 xl:h-72 xl:w-72"
              ring
            />
            <FoodCircle
              src="/uploads/dish-egg-plant.jpg"
              className="absolute bottom-6 start-0 h-40 w-40 xl:h-48 xl:w-48"
            />
            <FoodCircle
              src="/uploads/komonia-1789253192220.jpg"
              className="absolute bottom-0 end-2 h-32 w-32 xl:h-36 xl:w-36"
            />
          </motion.div>

          {/* Caption */}
          <div className="max-w-sm">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-gold/50" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Admin Portal</span>
            </div>
            <p className="font-display text-2xl font-semibold leading-snug text-cream">
              Manage the menu, prices, and every table’s welcome.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile brand strip (keeps the food section from pushing the form down) */}
      <div className="flex items-center gap-2.5 bg-ink px-6 py-4 text-cream lg:hidden">
        <LogoMark className="h-7 w-7 text-gold" />
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-bold">Bit Bladi</span>
          <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-gold">Taste of Home</span>
        </span>
      </div>

      {/* ── Right: login form (cream room) ── */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-12 sm:px-10">
        <LineArt className="pointer-events-none absolute -end-16 -top-10 hidden h-64 w-64 text-gold/10 sm:block" />
        <motion.div
          className="relative w-full max-w-sm"
          initial={fadeUp.initial}
          animate={fadeUp.animate}
          transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-2 flex items-center gap-3">
            <span className="h-px w-8 bg-gold/60" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Welcome Back</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Bit Bladi Admin Portal</h1>
          <p className="mt-2 text-sm text-muted">Sign in to manage your restaurant.</p>

          <form action={action} className="mt-8 space-y-4">
            <input type="hidden" name="from" value={params.get("from") ?? ""} />

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-soft">Email Address</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                defaultValue="admin@bitbladi.com"
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink shadow-sm outline-none transition-[border-color,box-shadow] focus:border-gold focus:shadow-[0_0_0_3px_rgba(217,164,65,0.18)]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-soft">Password</span>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full rounded-xl border border-line bg-surface px-4 py-3 pe-16 text-sm text-ink shadow-sm outline-none transition-[border-color,box-shadow] focus:border-gold focus:shadow-[0_0_0_3px_rgba(217,164,65,0.18)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute inset-y-0 end-3 my-auto h-6 text-xs font-semibold text-muted transition-colors hover:text-accent"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {state?.error && (
              <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent" role="alert">
                {state.error}
              </p>
            )}

            <motion.button
              type="submit"
              disabled={pending}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              className="btn btn-accent w-full py-3 text-sm font-semibold disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Spinner /> Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-xs text-muted">
            Trouble signing in? Contact your administrator.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function FoodCircle({ src, className = "", ring = false }: { src: string; className?: string; ring?: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-full shadow-lift ${
        ring ? "ring-4 ring-gold/30" : "ring-2 ring-cream/15"
      } ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path d="M16 4 30 28H2L16 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 13l6 10H10l6-10Z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function LineArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="70" />
      <circle cx="100" cy="100" r="52" strokeDasharray="4 8" />
      <path d="M100 30C100 70 70 90 40 96M100 30c0 40 30 60 60 66" strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="me-1 inline h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
