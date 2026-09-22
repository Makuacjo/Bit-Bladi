"use client";

import { useState } from "react";

export function ImageUploader({
  value,
  onChange,
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
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
      onChange(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-700">{label}</label>
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-zinc-400">No image</span>
          )}
        </div>
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
            className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gold file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-gold-bright"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/uploads/… or paste URL"
            className="mt-2 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-xs text-zinc-600"
          />
          {busy && <p className="mt-1 text-xs text-zinc-500">Uploading…</p>}
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="mt-1 text-xs text-red-600 hover:underline"
            >
              Remove image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
