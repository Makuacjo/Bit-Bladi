"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ImageUploader } from "./ImageUploader";
import { saveFood, deleteFood, toggleFoodAvailability, setFoodVisibility } from "@/app/admin/actions";

export type AdminFood = {
  id: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  price: number;
  image: string;
  categoryId: string;
  available: boolean;
  visible: boolean;
  featured: boolean;
  popular: boolean;
  sort: number;
};

export type AdminCategory = { id: string; nameEn: string; nameAr: string };

type StatusFilter = "all" | "available" | "sold_out" | "hidden";

const blank = (categoryId: string): AdminFood => ({
  id: "",
  nameEn: "",
  nameAr: "",
  descEn: "",
  descAr: "",
  price: 0,
  image: "",
  categoryId,
  available: true,
  visible: true,
  featured: false,
  popular: false,
  sort: 0,
});

export function FoodManager({
  foods,
  categories,
}: {
  foods: AdminFood[];
  categories: AdminCategory[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminFood | null>(null);
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const matchStatus = (f: AdminFood) =>
    status === "all"
      ? true
      : status === "hidden"
        ? !f.visible
        : status === "sold_out"
          ? f.visible && !f.available
          : /* available */ f.visible && f.available;

  const shown = foods.filter(
    (f) =>
      matchStatus(f) &&
      (!filter ||
        f.nameEn.toLowerCase().includes(filter.toLowerCase()) ||
        f.nameAr.includes(filter))
  );
  const catName = (id: string) => categories.find((c) => c.id === id)?.nameEn ?? "—";

  const counts = {
    all: foods.length,
    available: foods.filter((f) => f.visible && f.available).length,
    sold_out: foods.filter((f) => f.visible && !f.available).length,
    hidden: foods.filter((f) => !f.visible).length,
  };

  async function onToggleAvailable(f: AdminFood) {
    await toggleFoodAvailability(f.id, !f.available);
    router.refresh();
  }
  async function onToggleVisible(f: AdminFood) {
    await setFoodVisibility(f.id, !f.visible);
    router.refresh();
  }
  async function onDelete(f: AdminFood) {
    if (!confirm(`Delete "${f.nameEn}"? This cannot be undone.`)) return;
    await deleteFood(f.id);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Menu</h1>
          <p className="text-sm text-zinc-500">{foods.length} dishes</p>
        </div>
        <div className="flex gap-2">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search dishes…"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            onClick={() => setEditing(blank(categories[0]?.id ?? ""))}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-gold-bright"
          >
            + Add dish
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1">
        {([
          ["all", "All"],
          ["available", "Available"],
          ["sold_out", "Sold Out"],
          ["hidden", "Hidden"],
        ] as [StatusFilter, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatus(key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              status === key ? "bg-gold text-ink" : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {label} <span className="opacity-60">{counts[key]}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Dish</th>
              <th className="hidden px-4 py-3 md:table-cell">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="hidden px-4 py-3 sm:table-cell">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {shown.map((f) => (
              <tr key={f.id} className={`hover:bg-zinc-50 ${!f.visible ? "opacity-60" : ""}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                      {f.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.image} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <div className="font-medium text-zinc-900">{f.nameEn}</div>
                      <div className="text-xs text-zinc-400" dir="rtl">{f.nameAr}</div>
                    </div>
                    {f.featured && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">Featured</span>}
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-zinc-600 md:table-cell">{catName(f.categoryId)}</td>
                <td className="tabular-nums px-4 py-3 font-medium">{f.price.toLocaleString()}</td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <div className="flex flex-col gap-1">
                    {!f.visible ? (
                      <span className="w-fit rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-white">Hidden</span>
                    ) : f.available ? (
                      <span className="w-fit rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">Available</span>
                    ) : (
                      <span className="w-fit rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">Sold Out</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                    <button
                      onClick={() => onToggleAvailable(f)}
                      className="text-zinc-700 hover:underline"
                      title={f.available ? "Mark sold out" : "Mark available"}
                    >
                      {f.available ? "Mark sold out" : "Mark available"}
                    </button>
                    <button
                      onClick={() => onToggleVisible(f)}
                      className="text-zinc-700 hover:underline"
                    >
                      {f.visible ? "Hide" : "Show"}
                    </button>
                    <button onClick={() => setEditing(f)} className="text-zinc-700 hover:underline">Edit</button>
                    <button onClick={() => onDelete(f)} className="text-red-600 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-zinc-400">No dishes found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {editing && (
          <FoodEditor
            key={editing.id || "new"}
            food={editing}
            categories={categories}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FoodEditor({
  food,
  categories,
  onClose,
  onSaved,
}: {
  food: AdminFood;
  categories: AdminCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState<AdminFood>(food);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof AdminFood>(k: K, v: AdminFood[K]) => setF((p) => ({ ...p, [k]: v }));

  async function save() {
    setSaving(true);
    setError("");
    try {
      await saveFood({
        id: f.id || undefined,
        nameEn: f.nameEn,
        nameAr: f.nameAr,
        descEn: f.descEn,
        descAr: f.descAr,
        price: Number(f.price),
        image: f.image,
        categoryId: f.categoryId,
        available: f.available,
        visible: f.visible,
        featured: f.featured,
        popular: f.popular,
        sort: Number(f.sort),
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setSaving(false);
    }
  }

  return (
    <>
      <motion.div className="fixed inset-0 z-40 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto bg-white p-6 shadow-xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{f.id ? "Edit dish" : "New dish"}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700">✕</button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Text label="Name (English)" value={f.nameEn} onChange={(v) => set("nameEn", v)} />
            <Text label="Name (Arabic)" value={f.nameAr} onChange={(v) => set("nameAr", v)} rtl />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Area label="Description (English)" value={f.descEn} onChange={(v) => set("descEn", v)} />
            <Area label="Description (Arabic)" value={f.descAr} onChange={(v) => set("descAr", v)} rtl />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Text label="Price" value={String(f.price)} onChange={(v) => set("price", Number(v.replace(/[^\d]/g, "")) || 0)} type="number" />
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Category</label>
              <select
                value={f.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nameEn}</option>
                ))}
              </select>
            </div>
          </div>

          <ImageUploader value={f.image} onChange={(v) => set("image", v)} label="Dish photo" />

          <div className="flex flex-wrap gap-4">
            <Toggle label="Visible on site" checked={f.visible} onChange={(v) => set("visible", v)} />
            <Toggle label="Available (in stock)" checked={f.available} onChange={(v) => set("available", v)} />
            <Toggle label="Featured" checked={f.featured} onChange={(v) => set("featured", v)} />
            <Toggle label="Popular" checked={f.popular} onChange={(v) => set("popular", v)} />
          </div>
          <Text label="Sort order" value={String(f.sort)} onChange={(v) => set("sort", Number(v.replace(/[^\d]/g, "")) || 0)} type="number" />

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm">Cancel</button>
            <button onClick={save} disabled={saving} className="flex-1 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-gold-bright disabled:opacity-60">
              {saving ? "Saving…" : "Save dish"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function Text({ label, value, onChange, type = "text", rtl }: { label: string; value: string; onChange: (v: string) => void; type?: string; rtl?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-700">{label}</label>
      <input type={type} value={value} dir={rtl ? "rtl" : undefined} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
    </div>
  );
}
function Area({ label, value, onChange, rtl }: { label: string; value: string; onChange: (v: string) => void; rtl?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-700">{label}</label>
      <textarea value={value} rows={2} dir={rtl ? "rtl" : undefined} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
    </div>
  );
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-zinc-700">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-zinc-300" />
      {label}
    </label>
  );
}
