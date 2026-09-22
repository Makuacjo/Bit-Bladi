"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMedia } from "@/app/admin/actions";

export type AdminMedia = { id: string; url: string; filename: string; used: boolean };

export function MediaManager({ media }: { media: AdminMedia[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(m: AdminMedia) {
    const msg = m.used
      ? `"${m.filename}" is used on the site. Delete anyway? Referencing content will lose its image.`
      : `Delete "${m.filename}"?`;
    if (!confirm(msg)) return;
    await deleteMedia(m.id);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Media</h1>
          <p className="text-sm text-zinc-500">{media.length} images</p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
          />
          <button onClick={() => inputRef.current?.click()} disabled={busy} className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-gold-bright disabled:opacity-60">
            {busy ? "Uploading…" : "Upload image"}
          </button>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {media.map((m) => (
          <div key={m.id} className="group overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="aspect-square bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.filename} className="h-full w-full object-cover" />
            </div>
            <div className="p-2">
              <p className="truncate text-xs text-zinc-500" title={m.filename}>{m.filename}</p>
              <div className="mt-1 flex items-center justify-between">
                {m.used ? (
                  <span className="text-[10px] font-semibold text-green-600">In use</span>
                ) : (
                  <span className="text-[10px] text-zinc-400">Unused</span>
                )}
                <button onClick={() => onDelete(m)} className="text-[11px] text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {media.length === 0 && <p className="text-sm text-zinc-400">No images uploaded yet.</p>}
      </div>
    </div>
  );
}
