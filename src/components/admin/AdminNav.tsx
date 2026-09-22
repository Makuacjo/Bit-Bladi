"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const links: { href: string; label: string; exact?: boolean; icon: ReactNode }[] = [
  { href: "/admin", label: "Dashboard", exact: true, icon: <IconGrid /> },
  { href: "/admin/menu", label: "Menu", icon: <IconDish /> },
  { href: "/admin/categories", label: "Categories", icon: <IconTag /> },
  { href: "/admin/promotions", label: "Promotions", icon: <IconSpark /> },
  { href: "/admin/reviews", label: "Reviews", icon: <IconStar /> },
  { href: "/admin/reservations", label: "Reservations", icon: <IconCalendar /> },
  { href: "/admin/media", label: "Media", icon: <IconImage /> },
  { href: "/admin/settings", label: "Settings", icon: <IconGear /> },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`group inline-flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-gold/15 text-ink"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-ink"
            }`}
          >
            <span className={active ? "text-gold" : "text-zinc-400 group-hover:text-gold"}>{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

function svg(children: ReactNode) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}
function IconGrid() { return svg(<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>); }
function IconDish() { return svg(<><path d="M4 13a8 8 0 0 1 16 0" /><path d="M2 13h20M12 5v-.5" /><path d="M4 18h16" /></>); }
function IconTag() { return svg(<><path d="M3 3h7l11 11-7 7L3 10V3Z" /><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" /></>); }
function IconSpark() { return svg(<><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></>); }
function IconStar() { return svg(<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />); }
function IconImage() { return svg(<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="m5 18 5-5 4 3 2-2 3 3" /></>); }
function IconCalendar() { return svg(<><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></>); }
function IconGear() { return svg(<><circle cx="12" cy="12" r="3.2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></>); }
