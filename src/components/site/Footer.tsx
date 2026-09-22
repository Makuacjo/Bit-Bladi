import Link from "next/link";
import { ScrollLink } from "./ScrollLink";
import { LangSwitch } from "./LangSwitch";
import { NewsletterForm } from "./NewsletterForm";
import type { Lang, Dict } from "@/lib/i18n";
import type { SiteContent } from "@/lib/content";

export function Footer({
  lang,
  dict,
  content,
  businessName,
}: {
  lang: Lang;
  dict: Dict;
  content: SiteContent;
  businessName: string;
}) {
  const t = <T extends { en: string; ar: string }>(v: T) => (lang === "ar" ? v.ar : v.en);
  const c = content.contact;
  const f = dict.foot;
  const base = `/${lang}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.mapQuery)}`;
  const wa = `https://wa.me/${c.whatsapp.replace(/\D/g, "")}`;

  // Order: WhatsApp → Instagram → Facebook → TikTok. All icons always render;
  // each links to its CMS value (Admin → Settings → Social links) so links can
  // be managed there. Facebook defaults to the verified Bank of Khartoum page.
  // Icons with no URL yet show as non-clickable placeholders (no guessed URLs).
  const facebookUrl = content.social.facebook || "https://www.facebook.com/BankofKhartoum1913";
  const socials: { label: string; href: string; icon: React.ReactNode }[] = [
    { label: "WhatsApp", href: wa, icon: <IconWhatsApp /> },
    { label: "Instagram", href: content.social.instagram, icon: <IconInstagram /> },
    { label: "Facebook", href: facebookUrl, icon: <IconFacebook /> },
    { label: "TikTok", href: content.social.tiktok, icon: <IconTikTok /> },
  ];

  const bottomNav = [
    { href: base, label: dict.nav.home },
    { href: `${base}/menu`, label: dict.nav.menu },
    { href: `${base}#about`, label: dict.nav.about },
    { href: `${base}#menu`, label: dict.nav.gallery },
    { href: `${base}/reserve`, label: dict.reserve.nav },
    { href: `${base}#visit`, label: dict.nav.contact },
  ];

  return (
    <footer id="contact" className="scroll-mt-24 bg-ink text-cream">
      <div className="container-x grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8 text-gold" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl font-bold text-cream">{businessName}</span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">{dict.home.tagline}</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-cream/60">{t(content.footer.tagline)}</p>
        </div>

        {/* Location */}
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-gold">
            <IconPin /> {f.ourLocation}
          </h4>
          <p className="mt-3 text-sm leading-relaxed text-cream/70">{t(c.address)}</p>
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-gold hover:text-gold-bright">
            {f.viewOnMaps}
            <Arrow />
          </a>
        </div>

        {/* Hours */}
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-gold">
            <IconClock /> {f.openingHours}
          </h4>
          <p className="mt-3 text-sm text-cream/70">{f.hoursDays}</p>
          <p className="text-sm text-cream/70">{f.hoursTime}</p>
        </div>

        {/* Newsletter + social */}
        <div>
          <h4 className="text-sm font-semibold text-gold">{f.stayConnected}</h4>
          <p className="mt-3 text-sm text-cream/60">{f.stayConnectedDesc}</p>
          <NewsletterForm dict={dict} />
          <div className="mt-5 flex items-center gap-3">
            {socials.map((s) =>
              s.href ? (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-cream/15 text-cream/80 transition-colors hover:border-gold hover:text-gold"
                >
                  {s.icon}
                </a>
              ) : (
                <span
                  key={s.label}
                  aria-label={`${s.label} (coming soon)`}
                  aria-disabled="true"
                  title={`${s.label} — link coming soon`}
                  className="grid h-9 w-9 cursor-default place-items-center rounded-full border border-cream/10 text-cream/30"
                >
                  {s.icon}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream/10">
        <div className="container-x flex flex-col items-center justify-between gap-4 py-5 text-xs text-cream/55 md:flex-row">
          <p>{t(content.footer.copyright)}</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {bottomNav.map((l) => (
              <ScrollLink key={l.label} href={l.href} className="hover:text-gold">
                {l.label}
              </ScrollLink>
            ))}
            <Link href="/admin" className="hover:text-gold">
              {f.admin}
            </Link>
          </nav>
          <LangSwitch lang={lang} />
        </div>
      </div>
    </footer>
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
function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rtl:rotate-180" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconFacebook() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v6h3v-6h3l1-3h-4v-2c0-.6.4-1 1-1Z" />
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconTikTok() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 3c.3 2 1.6 3.6 3.5 4v2.6c-1.3 0-2.5-.4-3.5-1v5.6a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.7a2.9 2.9 0 1 0 2 2.8V3H16Z" />
    </svg>
  );
}
function IconWhatsApp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Zm5 12.5c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .2-3.2-.7-2.7-1.1-4.4-3.9-4.5-4.1-.1-.2-1-1.4-1-2.6s.6-1.8.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.1.3.7 1.1 1.4 1.7.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.6-.1l1.9.9c.3.1.4.2.5.3.1.3.1.7-.1 1.3Z" />
    </svg>
  );
}
