import { Reveal } from "./Reveal";
import type { Dict } from "@/lib/i18n";

export function MapSection({
  dict,
  name,
  addressLine,
  query,
  phone,
  hours,
}: {
  dict: Dict;
  name: string;
  addressLine: string;
  query: string;
  phone: string;
  hours: string;
}) {
  // Plain, keyless Google Maps URLs built from the place query — no Maps JS API,
  // no billing, and no hard-coded coordinates. The embed and the buttons all
  // resolve the same search so they always point at the real location.
  const q = encodeURIComponent(query);
  const embedUrl = `https://maps.google.com/maps?q=${q}&z=16&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${q}`;

  return (
    <section id="visit" className="container-x scroll-mt-24 py-20">
      <div className="grid items-stretch gap-6 lg:grid-cols-[1fr_1.15fr]">
        <Reveal>
          <div className="flex h-full flex-col justify-center">
            <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">{dict.location.title}</h2>
            <p className="mt-2 text-lg text-ink-soft">{dict.location.subtitle}</p>

            <div className="mt-6 space-y-3 text-ink-soft">
              <p className="font-medium text-ink">{name}</p>
              <p>
                <a href={searchUrl} target="_blank" rel="noreferrer" className="hover:text-accent">
                  {addressLine}
                </a>
              </p>
              <p className="text-sm">{hours}</p>
              <p className="text-sm">
                <a href={`tel:${phone}`} className="hover:text-accent">{phone}</a>
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-accent text-sm"
                aria-label={`${dict.location.directions} — ${name}`}
              >
                <DirectionsIcon />
                {dict.location.directions}
              </a>
              <a
                href={searchUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost text-sm"
                aria-label={`${dict.location.openMaps} — ${name}`}
              >
                {dict.location.openMaps}
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="h-72 overflow-hidden rounded-2xl shadow-soft ring-1 ring-line/60 sm:h-80 lg:h-[26rem]">
            <iframe
              src={embedUrl}
              title={dict.location.mapLabel}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function DirectionsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="m21.7 10.3-8-8a1 1 0 0 0-1.4 0l-10 10a1 1 0 0 0 0 1.4l8 8a1 1 0 0 0 1.4 0l10-10a1 1 0 0 0 0-1.4Z" />
      <path d="M9 12h4v3l4-4-4-4v3H8a1 1 0 0 0-1 1v3" />
    </svg>
  );
}
