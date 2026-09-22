"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCart, useHydratedCart } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { LangSwitch } from "./LangSwitch";
import { ScrollLink } from "./ScrollLink";
import type { Lang, Dict } from "@/lib/i18n";

export function Navbar({
  lang,
  dict,
  businessName,
}: {
  lang: Lang;
  dict: Dict;
  businessName: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const hydrated = useHydratedCart();
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const openCart = useUI((s) => s.openCart);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu overlay is open.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const base = `/${lang}`;
  // Transparent only over the homepage hero; solid on every other route/scroll
  // so the cream nav text stays readable on light pages.
  const isHome = pathname === base || pathname === `${base}/`;
  const transparent = isHome && !scrolled;
  // At the top of the homepage the bar is transparent over the light hero photo,
  // so text must be dark; once scrolled (or on any other route) the bar is dark
  // brown, so text is cream. Gold accents stay gold in both states.
  const brandText = transparent ? "text-ink" : "text-cream";
  const linkClass = `text-sm font-medium transition-colors ${
    transparent ? "text-ink hover:text-accent" : "text-cream/85 hover:text-gold"
  }`;
  const iconBtnClass = `relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
    transparent ? "border-ink/25 text-ink hover:border-accent hover:text-accent" : "border-cream/25 text-cream hover:border-gold hover:text-gold"
  }`;
  const links = [
    { href: `${base}`, label: dict.nav.home },
    { href: `${base}/menu`, label: dict.nav.menu },
    { href: `${base}#about`, label: dict.nav.about },
    { href: `${base}#menu`, label: dict.nav.gallery },
    { href: `${base}/reserve`, label: dict.reserve.nav },
    { href: `${base}#visit`, label: dict.nav.contact },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 text-cream transition-all duration-300 ${
          transparent
            ? "bg-transparent border-b border-transparent"
            : "bg-brown/95 backdrop-blur border-b border-gold/15"
        }`}
      >
        <div className="container-x flex h-20 items-center justify-between gap-4">
          {/* Logo + tagline */}
          <ScrollLink href={base} className="group flex items-center gap-2.5">
            <LogoMark className="h-8 w-8 text-gold" />
            <span className="flex flex-col leading-none">
              <span className={`font-display text-xl font-bold tracking-tight transition-colors md:text-2xl ${brandText}`}>
                {businessName}
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
                {dict.home.tagline}
              </span>
            </span>
          </ScrollLink>

          <nav className="hidden items-center gap-6 lg:flex">
            {links.map((l) => (
              <ScrollLink key={l.label} href={l.href} className={linkClass}>
                {l.label}
              </ScrollLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
            <LangSwitch lang={lang} onLight={transparent} />

            <button
              onClick={openCart}
              className={iconBtnClass}
              aria-label={dict.cart.open}
            >
              <CartIcon />
              {hydrated && count > 0 && (
                <span className="absolute -top-1 -end-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-ink">
                  {count}
                </span>
              )}
            </button>

            <span className="hidden md:inline-flex">
              <Link href={`${base}/menu`} className="btn btn-accent text-sm">
                {dict.home.orderNow}
                <Arrow />
              </Link>
            </span>

            <button
              onClick={() => setMenuOpen(true)}
              className={`${iconBtnClass} lg:hidden`}
              aria-label="Open menu"
            >
              <BurgerIcon />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-brown text-cream lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="container-x flex h-20 items-center justify-between">
              <span className="flex flex-col leading-none">
                <span className="font-display text-xl font-bold text-cream">{businessName}</span>
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
                  {dict.home.tagline}
                </span>
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/25"
                aria-label={dict.common.close}
              >
                <CloseIcon />
              </button>
            </div>
            <nav className="container-x mt-8 flex flex-col gap-6">
              {links.map((l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <ScrollLink
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-display text-3xl font-semibold text-cream"
                  >
                    {l.label}
                  </ScrollLink>
                </motion.div>
              ))}
              <Link
                href={`${base}/menu`}
                onClick={() => setMenuOpen(false)}
                className="btn btn-accent mt-4 self-start text-base"
              >
                {dict.home.orderNow}
                <Arrow />
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function LogoMark({ className }: { className?: string }) {
  // Simple gold "mountain/hut" mark echoing the wordmark — pure CSS/SVG, no asset change.
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path d="M16 4 30 28H2L16 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 13l6 10H10l6-10Z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}
function Arrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ms-0.5 rtl:rotate-180" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
function BurgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
