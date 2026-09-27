import Link from "next/link";
import type { Lang } from "@/lib/i18n";

// Visual breadcrumb trail for content pages. Pair with breadcrumbJsonLd for the
// matching structured data. The final crumb is the current page (not a link).
export function Breadcrumbs({
  lang,
  items,
}: {
  lang: Lang;
  items: { name: string; path?: string }[];
}) {
  return (
    <nav
      aria-label={lang === "ar" ? "مسار التنقل" : "Breadcrumb"}
      className="text-sm text-muted"
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-2">
              {it.path && !last ? (
                <Link href={it.path} className="hover:text-accent">
                  {it.name}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="text-ink-soft">
                  {it.name}
                </span>
              )}
              {!last && (
                <span aria-hidden="true" className="text-muted/60 rtl:rotate-180">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
