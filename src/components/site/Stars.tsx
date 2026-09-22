// Read-only star display with precise fractional fill (e.g. 4.6 → 4½+ stars).
// Plain (no hooks) so it renders in server or client components. Filled stars
// use the brand gold/accent; the empty track is a faint version underneath.
export function Stars({
  value,
  size = 18,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span
      className={`relative inline-flex ${className}`}
      role="img"
      aria-label={`${value} out of 5 stars`}
      style={{ width: size * 5 + 4 * 2, height: size }}
    >
      {/* empty track */}
      <Row size={size} className="text-accent/20" />
      {/* filled overlay clipped to the exact percentage (RTL-safe via inset-inline-start) */}
      <span className="absolute inset-y-0 start-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <Row size={size} className="text-gold" />
      </span>
    </span>
  );
}

function Row({ size, className }: { size: number; className: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
          <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.9l-5.81 3.06 1.11-6.47L2.6 9.9l6.5-.95L12 2.5z" />
        </svg>
      ))}
    </span>
  );
}
