'use client';

import { getStatusConfig } from '@/lib/show-status';

const colorClasses: Record<string, string> = {
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  red: 'bg-red-500/20 text-red-400 border-red-500/50',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  violet: 'bg-violet-500/20 text-violet-400 border-violet-500/50',
  zinc: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50',
};

export function ShowStatusBadge({ status }: { status: string | null | undefined }) {
  const config = getStatusConfig(status);
  const classes = colorClasses[config.color] ?? colorClasses.emerald;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${classes}`}
    >
      {config.label}
    </span>
  );
}
