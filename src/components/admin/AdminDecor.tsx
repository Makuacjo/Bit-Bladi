// Reusable, purely-decorative culinary line-art for the admin CMS — the same
// motif as the login page (concentric plate rings + herb sprig). All variants
// are aria-hidden and pointer-events:none via the .admin-decor helper, so they
// never touch click targets, keyboard focus, or screen readers.

export function PlateArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="70" />
      <circle cx="100" cy="100" r="52" strokeDasharray="4 8" />
      <path d="M100 30C100 70 70 90 40 96M100 30c0 40 30 60 60 66" strokeLinecap="round" />
    </svg>
  );
}

export function SprigArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M60 112C60 70 48 44 20 28M60 112c0-42 12-68 40-84" strokeLinecap="round" />
      <path d="M60 92c-14-4-24-14-30-28M60 92c14-4 24-14 30-28M60 66c-11-3-18-11-23-22M60 66c11-3 18-11 23-22" strokeLinecap="round" />
    </svg>
  );
}

export function ForkKnifeArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M40 16v22a10 10 0 0 0 20 0V16M50 38v66" />
      <path d="M80 16c-8 0-14 9-14 22s6 22 14 22m0-44v88" />
    </svg>
  );
}
