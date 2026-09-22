"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";
import { savePromotion, deletePromotion } from "@/app/admin/actions";

export type AdminPromo = {
  id: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  image: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
};

const blank = (): AdminPromo => ({ id: "", titleEn: "", titleAr: "", descEn: "", descAr: "", image: "", active: true, startsAt: "", endsAt: "" });

export function PromotionManager({ promotions }: { promotions: AdminPromo[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminPromo | null>(null);

  async function onDelete(p: AdminPromo) {
    if (!confirm(`Delete promotion "${p.titleEn}"?`)) return;
    await deletePromotion(p.id);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Promotions</h1>
        <button onClick={() => setEditing(blank())} className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-gold-bright">
          + Add promotion
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {promotions.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            {p.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt="" className="h-36 w-full object-cover" />
            )}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.titleEn}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.active ? "bg-green-100 text-green-700" : "bg-zinc-200 text-zinc-600"}`}>
                  {p.active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{p.descEn}</p>
              <div className="mt-3 flex gap-3 text-sm">
                <button onClick={() => setEditing(p)} className="text-zinc-700 hover:underline">Edit</button>
                <button onClick={() => onDelete(p)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {promotions.length === 0 && <p className="text-sm text-zinc-400">No promotions yet.</p>}
      </div>

      {editing && (
        <PromoEditor promo={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); router.refresh(); }} />
      )}
    </div>
  );
}

function PromoEditor({ promo, onClose, onSaved }: { promo: AdminPromo; onClose: () => void; onSaved: () => void }) {
  const [p, setP] = useState(promo);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof AdminPromo>(k: K, v: AdminPromo[K]) => setP((s) => ({ ...s, [k]: v }));

  async function save() {
    setSaving(true);
    setError("");
    try {
      await savePromotion({ ...p, id: p.id || undefined });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto" onClick={onClose}>
      <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-bold">{p.id ? "Edit promotion" : "New promotion"}</h2>
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Inp label="Title (English)" value={p.titleEn} onChange={(v) => set("titleEn", v)} />
            <Inp label="Title (Arabic)" value={p.titleAr} onChange={(v) => set("titleAr", v)} rtl />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Inp label="Description (English)" value={p.descEn} onChange={(v) => set("descEn", v)} />
            <Inp label="Description (Arabic)" value={p.descAr} onChange={(v) => set("descAr", v)} rtl />
          </div>
          <ImageUploader value={p.image} onChange={(v) => set("image", v)} label="Promotion image" />
          <div className="grid grid-cols-2 gap-3">
            <Inp label="Starts (optional)" value={p.startsAt} onChange={(v) => set("startsAt", v)} type="date" />
            <Inp label="Ends (optional)" value={p.endsAt} onChange={(v) => set("endsAt", v)} type="date" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={p.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4" />
            Active
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm">Cancel</button>
            <button onClick={save} disabled={saving} className="flex-1 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-gold-bright disabled:opacity-60">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Inp({ label, value, onChange, type = "text", rtl }: { label: string; value: string; onChange: (v: string) => void; type?: string; rtl?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-700">{label}</span>
      <input type={type} value={value} dir={rtl ? "rtl" : undefined} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
    </label>
  );
}
