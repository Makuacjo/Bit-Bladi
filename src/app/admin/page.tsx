import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireAdmin();
  const [total, available, soldOut, hidden, categories, activePromos, pendingReviews, pendingReservations] = await Promise.all([
    prisma.foodItem.count(),
    prisma.foodItem.count({ where: { visible: true, available: true } }),
    prisma.foodItem.count({ where: { visible: true, available: false } }),
    prisma.foodItem.count({ where: { visible: false } }),
    prisma.category.count(),
    prisma.promotion.count({ where: { active: true } }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.reservation.count({ where: { status: "PENDING" } }),
  ]);

  const stats = [
    { label: "Menu items", value: total, href: "/admin/menu" },
    { label: "Available", value: available, href: "/admin/menu" },
    { label: "Sold out", value: soldOut, href: "/admin/menu" },
    { label: "Hidden", value: hidden, href: "/admin/menu" },
    { label: "Categories", value: categories, href: "/admin/categories" },
    { label: "Active promotions", value: activePromos, href: "/admin/promotions" },
    { label: "Pending reviews", value: pendingReviews, href: "/admin/reviews", highlight: pendingReviews > 0 },
    { label: "Pending reservations", value: pendingReservations, href: "/admin/reservations", highlight: pendingReservations > 0 },
  ];

  const name = session.name?.split(" ")[0] || "there";

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">Welcome back, {name}</h1>
        <p className="mt-1 text-sm text-zinc-500">Your Bit Bladi menu and content at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`group rounded-2xl border bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 ${
              s.highlight ? "border-gold/50 bg-gold/5" : "border-zinc-200 hover:border-gold/40"
            }`}
          >
            <div className="flex items-baseline gap-2">
              <span className={`tnum font-display text-3xl font-bold ${s.highlight ? "text-gold" : "text-ink"}`}>
                {s.value}
              </span>
              {s.highlight && <span className="h-2 w-2 rounded-full bg-gold" aria-hidden="true" />}
            </div>
            <div className="mt-1 text-sm text-zinc-500">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <QuickCard title="Manage the menu" body="Add dishes, set prices, upload photos, toggle availability." href="/admin/menu" cta="Open menu manager" />
        <QuickCard title="Edit the homepage" body="Update hero, about, delivery, contact, WhatsApp and SEO." href="/admin/settings" cta="Open settings" />
      </div>

      {pendingReviews > 0 && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-gold/40 bg-gold/10 px-5 py-4">
          <p className="text-sm text-ink">
            <span className="font-semibold">{pendingReviews}</span> review{pendingReviews > 1 ? "s" : ""} awaiting moderation.
          </p>
          <Link href="/admin/reviews" className="shrink-0 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-gold-bright">
            Review now
          </Link>
        </div>
      )}

      {pendingReservations > 0 && (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-gold/40 bg-gold/10 px-5 py-4">
          <p className="text-sm text-ink">
            <span className="font-semibold">{pendingReservations}</span> reservation{pendingReservations > 1 ? "s" : ""} awaiting confirmation.
          </p>
          <Link href="/admin/reservations" className="shrink-0 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-gold-bright">
            Manage now
          </Link>
        </div>
      )}
    </div>
  );
}

function QuickCard({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500">{body}</p>
      <Link href={href} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-warm">
        {cta}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rtl:rotate-180" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </Link>
    </div>
  );
}
