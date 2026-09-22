"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, type Lang } from "@/lib/i18n";

export function LangSwitch({ lang, onLight = false }: { lang: Lang; onLight?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(target: Lang) {
    if (target === lang) return;
    const parts = pathname.split("/");
    // parts[1] is the current locale segment
    if ((locales as readonly string[]).includes(parts[1])) {
      parts[1] = target;
    } else {
      parts.splice(1, 0, target);
    }
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    router.push(parts.join("/") + hash);
  }

  const cls = (active: boolean) =>
    `text-sm font-semibold tracking-wide transition-colors ${
      active
        ? "text-gold"
        : onLight
          ? "text-ink/60 hover:text-accent"
          : "text-cream/70 hover:text-gold"
    }`;

  return (
    <span className="inline-flex items-center gap-1.5" aria-label="Switch language">
      <button onClick={() => switchTo("en")} className={cls(lang === "en")} aria-current={lang === "en"}>
        EN
      </button>
      <span className={onLight ? "text-ink/30" : "text-cream/40"}>|</span>
      <button onClick={() => switchTo("ar")} className={cls(lang === "ar")} aria-current={lang === "ar"}>
        العربية
      </button>
    </span>
  );
}
