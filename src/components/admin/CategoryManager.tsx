"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCategory, deleteCategory } from "@/app/admin/actions";

export type AdminCat = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  sort: number;
  enabled: boolean;
  count: number;
};

const blank = (): AdminCat => ({ id: "", slug: "", nameEn: "", nameAr: "", sort: 0, enabled: true, count: 0 });

export function CategoryManager({ categories }: { categories: AdminCat[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminCat | null>(null);
  const [error, setError] = useState("");

  async function onDelete(c: AdminCat) {
    if (!confirm(`Delete category "${c.nameEn}"?`)) return;
    setError("");
    try {
      await deleteCategory(c.id);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Categories</h1>
        <button onClick={() => setEditing(blank())} className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-gold-bright">
          + Add category
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Arabic</th>
              <th className="px-4 py-3">Dishes</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium">{c.nameEn}</td>
                <td className="px-4 py-3 text-zinc-500" dir="rtl">{c.nameAr}</td>
                <td className="px-4 py-3">{c.count}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.enabled ? "bg-green-100 text-green-700" : "bg-zinc-200 text-zinc-600"}`}>
                    {c.enabled ? "Enabled" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(c)} className="text-zinc-700 hover:underline">Edit</button>
                  <button onClick={() => onDelete(c)} className="ms-3 text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <CategoryEditor
          cat={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); router.refresh(); }}
        />
      )}
    </div>
  );
}

function CategoryEditor({ cat, onClose, onSaved }: { cat: AdminCat; onClose: () => void; onSaved: () => void }) {
  const [c, setC] = useState(cat);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof AdminCat>(k: K, v: AdminCat[K]) => setC((p) => ({ ...p, [k]: v }));

  async function save() {
    setSaving(true);
    setError("");
    try {
      await saveCategory({ id: c.id || undefined, slug: c.slug || c.nameEn, nameEn: c.nameEn, nameAr: c.nameAr, sort: Number(c.sort), enabled: c.enabled });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-bold">{c.id ? "Edit category" : "New category"}</h2>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">Name (English)</span>
            <input value={c.nameEn} onChange={(e) => set("nameEn", e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">Name (Arabic)</span>
            <input value={c.nameAr} dir="rtl" onChange={(e) => set("nameAr", e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">Sort order</span>
              <input type="number" value={c.sort} onChange={(e) => set("sort", Number(e.target.value) || 0)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
            </label>
            <label className="mt-6 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={c.enabled} onChange={(e) => set("enabled", e.target.checked)} className="h-4 w-4" />
              Enabled
            </label>
          </div>
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
