/**
 * Green “status light” when advance is marked complete for a date
 * (tour overview cards + sidebar).
 */
export function AdvanceCompleteGreenLight({
  className = '',
  label = 'Advance complete',
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={`relative inline-flex h-3 w-3 shrink-0 items-center justify-center ${className}`}
      title={label}
      aria-label={label}
      role="img"
    >
      <span
        className="absolute h-3 w-3 rounded-full bg-emerald-400/50 animate-pulse"
        aria-hidden
      />
      <span
        className="relative h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.85)] ring-2 ring-emerald-300/60"
        aria-hidden
      />
    </span>
  );
}
