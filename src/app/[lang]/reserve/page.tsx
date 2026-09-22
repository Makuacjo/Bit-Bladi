import type { Metadata } from "next";
import { getDict, type Lang } from "@/lib/i18n";
import { getSettings } from "@/lib/data";
import { RES_CONFIG } from "@/lib/reservations";
import { ReservationForm } from "@/components/site/ReservationForm";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const d = getDict((lang as Lang) || "en");
  return { title: `${d.reserve.title} — Bit Bladi`, description: d.reserve.subtitle };
}

export default async function ReservePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const dict = getDict(l);
  const r = dict.reserve;
  const settings = await getSettings();

  return (
    <section id="reserve" className="scroll-mt-24 bg-light-cream py-16 md:py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gold/50" />
            <span className="eyebrow">{r.eyebrow}</span>
            <span className="h-px w-10 bg-gold/50" />
          </div>
          <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">{r.title}</h1>
          <p className="mt-3 text-ink-soft">{r.subtitle}</p>
        </div>

        <div className="mt-10">
          <ReservationForm
            lang={l}
            dict={dict}
            whatsapp={settings.whatsappNumber}
            maxGuests={RES_CONFIG.maxGuestsPerBooking}
          />
        </div>
      </div>
    </section>
  );
}
