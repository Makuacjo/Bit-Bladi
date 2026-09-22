"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";
import { saveSettings, saveContent, resetContent } from "@/app/admin/actions";
import type { SiteContent, Bilingual } from "@/lib/content";

type Config = { businessName: string; currency: string; whatsappNumber: string };
type Tab = "config" | "home" | "about" | "contact" | "seo";

export function SettingsManager({
  config: initialConfig,
  content: initialContent,
}: {
  config: Config;
  content: SiteContent;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("config");
  const [config, setConfig] = useState(initialConfig);
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const setC = (updater: (c: SiteContent) => SiteContent) => setContent((c) => updater(structuredClone(c)));

  async function save() {
    setSaving(true);
    setMsg("");
    setError("");
    try {
      await saveSettings(config);
      await saveContent(JSON.stringify(content));
      setMsg("Saved. Public site updated.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    if (!confirm("Reset all homepage/content text to defaults? Config (WhatsApp, currency) is kept.")) return;
    await resetContent();
    router.refresh();
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "config", label: "Business & WhatsApp" },
    { id: "home", label: "Homepage" },
    { id: "about", label: "About & Delivery" },
    { id: "contact", label: "Contact & Footer" },
    { id: "seo", label: "SEO" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <div className="flex gap-2">
          <button onClick={reset} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600">Reset content</button>
          <button onClick={save} disabled={saving} className="rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-ink hover:bg-gold-bright disabled:opacity-60">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
      {msg && <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</p>}
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-zinc-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium ${
              tab === t.id ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 max-w-3xl space-y-5">
        {tab === "config" && (
          <Card title="Business & ordering">
            <Row label="Business name">
              <input value={config.businessName} onChange={(e) => setConfig({ ...config, businessName: e.target.value })} className="inp" />
            </Row>
            <Row label="Currency (e.g. KES, USD)">
              <input value={config.currency} onChange={(e) => setConfig({ ...config, currency: e.target.value })} className="inp" />
            </Row>
            <Row label="WhatsApp number (with country code, digits only)">
              <input value={config.whatsappNumber} onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })} className="inp" placeholder="254798022831" />
            </Row>
            <p className="text-xs text-zinc-500">Orders are sent to this WhatsApp number. Changing it affects all future orders instantly.</p>
          </Card>
        )}

        {tab === "home" && (
          <>
            <Card title="Hero">
              <Bi label="Hero title" value={content.hero.title} onChange={(v) => setC((c) => ((c.hero.title = v), c))} />
              <Bi label="Hero subtitle" value={content.hero.subtitle} onChange={(v) => setC((c) => ((c.hero.subtitle = v), c))} area />
              <Bi label="CTA button label" value={content.hero.ctaLabel} onChange={(v) => setC((c) => ((c.hero.ctaLabel = v), c))} />
              <label className="block text-sm font-medium text-zinc-700">Hero background images (rotate)</label>
              {content.hero.images.map((img, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex-1">
                    <ImageUploader value={img} label={`Image ${i + 1}`} onChange={(url) => setC((c) => ((c.hero.images[i] = url), c))} />
                  </div>
                  <button onClick={() => setC((c) => ((c.hero.images = c.hero.images.filter((_, j) => j !== i)), c))} className="mb-2 text-xs text-red-600">Remove</button>
                </div>
              ))}
              <button onClick={() => setC((c) => ((c.hero.images = [...c.hero.images, ""]), c))} className="text-sm text-zinc-700 underline">+ Add hero image</button>
            </Card>
          </>
        )}

        {tab === "about" && (
          <>
            <Card title="About">
              <Bi label="Heading" value={content.about.heading} onChange={(v) => setC((c) => ((c.about.heading = v), c))} />
              <Bi label="Body" value={content.about.body} onChange={(v) => setC((c) => ((c.about.body = v), c))} area />
            </Card>
            <Card title="Why choose us (4 points)">
              {content.whyUs.items.map((it, i) => (
                <div key={i} className="rounded-lg border border-zinc-100 p-3">
                  <Bi label={`Point ${i + 1} — title`} value={it.title} onChange={(v) => setC((c) => ((c.whyUs.items[i].title = v), c))} />
                  <Bi label="Text" value={it.body} onChange={(v) => setC((c) => ((c.whyUs.items[i].body = v), c))} />
                </div>
              ))}
            </Card>
            <Card title="Delivery">
              <Bi label="Heading" value={content.delivery.heading} onChange={(v) => setC((c) => ((c.delivery.heading = v), c))} />
              <Bi label="Body" value={content.delivery.body} onChange={(v) => setC((c) => ((c.delivery.body = v), c))} area />
              <Row label="Estimated time (minutes)">
                <input value={content.delivery.etaMinutes} onChange={(e) => setC((c) => ((c.delivery.etaMinutes = e.target.value), c))} className="inp" />
              </Row>
              <Bi label="Delivery fee text" value={content.delivery.fee} onChange={(v) => setC((c) => ((c.delivery.fee = v), c))} />
            </Card>
          </>
        )}

        {tab === "contact" && (
          <>
            <Card title="Contact">
              <Row label="Phone"><input value={content.contact.phone} onChange={(e) => setC((c) => ((c.contact.phone = e.target.value), c))} className="inp" /></Row>
              <Row label="WhatsApp (display)"><input value={content.contact.whatsapp} onChange={(e) => setC((c) => ((c.contact.whatsapp = e.target.value), c))} className="inp" /></Row>
              <Row label="Email"><input value={content.contact.email} onChange={(e) => setC((c) => ((c.contact.email = e.target.value), c))} className="inp" /></Row>
              <Bi label="Address" value={content.contact.address} onChange={(v) => setC((c) => ((c.contact.address = v), c))} />
              <Row label="Map search (Google Maps place query)"><input value={content.contact.mapQuery} onChange={(e) => setC((c) => ((c.contact.mapQuery = e.target.value), c))} className="inp" placeholder="Shujah Mall, Kilimani, Nairobi" /></Row>
              <Bi label="Opening hours" value={content.contact.hours} onChange={(v) => setC((c) => ((c.contact.hours = v), c))} />
            </Card>
            <Card title="Social links">
              <Row label="Instagram URL"><input value={content.social.instagram} onChange={(e) => setC((c) => ((c.social.instagram = e.target.value), c))} className="inp" /></Row>
              <Row label="Facebook URL"><input value={content.social.facebook} onChange={(e) => setC((c) => ((c.social.facebook = e.target.value), c))} className="inp" /></Row>
              <Row label="TikTok URL"><input value={content.social.tiktok} onChange={(e) => setC((c) => ((c.social.tiktok = e.target.value), c))} className="inp" /></Row>
            </Card>
            <Card title="Footer">
              <Bi label="Tagline" value={content.footer.tagline} onChange={(v) => setC((c) => ((c.footer.tagline = v), c))} />
              <Bi label="Copyright" value={content.footer.copyright} onChange={(v) => setC((c) => ((c.footer.copyright = v), c))} />
            </Card>
          </>
        )}

        {tab === "seo" && (
          <Card title="SEO & social sharing">
            <Bi label="Meta title" value={content.seo.title} onChange={(v) => setC((c) => ((c.seo.title = v), c))} />
            <Bi label="Meta description" value={content.seo.description} onChange={(v) => setC((c) => ((c.seo.description = v), c))} area />
            <ImageUploader value={content.seo.ogImage} label="Social share image" onChange={(url) => setC((c) => ((c.seo.ogImage = url), c))} />
          </Card>
        )}
      </div>

      <style jsx>{`
        .inp { width: 100%; border: 1px solid #d4d4d8; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; }
      `}</style>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="mb-4 font-semibold text-zinc-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-700">{label}</span>
      {children}
    </label>
  );
}

function Bi({
  label,
  value,
  onChange,
  area,
}: {
  label: string;
  value: Bilingual;
  onChange: (v: Bilingual) => void;
  area?: boolean;
}) {
  const cls = "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm";
  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-zinc-700">{label}</span>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {area ? (
          <textarea rows={3} value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} className={cls} placeholder="English" />
        ) : (
          <input value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} className={cls} placeholder="English" />
        )}
        {area ? (
          <textarea rows={3} dir="rtl" value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} className={cls} placeholder="العربية" />
        ) : (
          <input dir="rtl" value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} className={cls} placeholder="العربية" />
        )}
      </div>
    </div>
  );
}
