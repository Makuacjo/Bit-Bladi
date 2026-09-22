"use client";

import { useState } from "react";
import type { Dict } from "@/lib/i18n";

// Front-end only: there is no newsletter backend in this project, so this
// validates the address and shows a local confirmation. Wire to a real list
// provider (or a /api/subscribe route) when one is chosen.
export function NewsletterForm({ dict }: { dict: Dict }) {
  const f = dict.foot;
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "done" | "error">("idle");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setState("error");
      return;
    }
    setState("done");
    setEmail("");
  }

  if (state === "done") {
    return <p className="mt-4 text-sm text-gold">{f.subscribed}</p>;
  }

  return (
    <form onSubmit={submit} className="mt-4" noValidate>
      <div className="flex items-center gap-2 rounded-full border border-cream/20 bg-cream/5 p-1 ps-4 focus-within:border-gold">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          placeholder={f.emailPlaceholder}
          aria-label={f.emailPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-cream placeholder:text-cream/40 focus:outline-none"
        />
        <button
          type="submit"
          aria-label={f.subscribe}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-ink transition-colors hover:bg-gold-bright"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rtl:rotate-180" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {state === "error" && <p className="mt-2 text-xs text-gold">{f.emailInvalid}</p>}
    </form>
  );
}
