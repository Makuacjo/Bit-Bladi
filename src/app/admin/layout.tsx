import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logoutAction } from "./actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { PlateArt, SprigArt } from "@/components/admin/AdminDecor";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Login screen (no session) renders without the admin chrome.
  if (!session) return <div className="font-body">{children}</div>;

  return (
    <div className="admin-shell min-h-screen font-body text-ink">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        {/* Sidebar — warm cream with a faint culinary accent near the bottom */}
        <aside className="relative flex flex-col overflow-hidden border-b border-zinc-200 bg-light-cream p-4 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-e">
          <div className="relative z-10">
            <div className="mb-5 flex items-center gap-2.5">
              <LogoMark className="h-8 w-8 text-gold" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg font-bold text-ink">Bit Bladi</span>
                <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-gold">
                  Admin · CMS
                </span>
              </span>
            </div>
            <AdminNav />
          </div>

          <div className="relative z-10 mt-4 space-y-2 border-t border-zinc-200 pt-4 text-sm lg:mt-auto">
            <Link href="/en" target="_blank" className="block text-zinc-600 transition-colors hover:text-accent">
              View site ↗
            </Link>
            <form action={logoutAction}>
              <button className="text-accent transition-colors hover:text-accent-warm" type="submit">
                Sign out
              </button>
            </form>
            <p className="pt-2 text-xs text-zinc-400">{session.email}</p>
          </div>

          {/* Decorative sprig — faint, non-interactive, sidebar bottom corner */}
          <SprigArt className="admin-decor -bottom-6 -end-6 h-40 w-40 opacity-[0.07] lg:block" />
        </aside>

        <main className="relative flex-1 overflow-hidden p-5 lg:p-8">
          <PlateArt className="admin-decor -end-16 -top-16 h-64 w-64 opacity-[0.05]" />
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path d="M16 4 30 28H2L16 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 13l6 10H10l6-10Z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}
