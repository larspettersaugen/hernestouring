/** Show status values and their display config */
export const SHOW_STATUSES = [
  { value: 'confirmed', label: 'Confirmed', color: 'emerald' },
  { value: 'tbc', label: 'TBC', color: 'amber' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'pitch', label: 'Pitch', color: 'blue' },
  { value: 'opportunity', label: 'Opportunity', color: 'violet' },
  { value: 'lost_pitch', label: 'Lost Pitch', color: 'zinc' },
] as const;

export type ShowStatusValue = (typeof SHOW_STATUSES)[number]['value'];

const statusCardClasses: Record<string, string> = {
  emerald: 'bg-stage-card border-emerald-500/50 hover:border-emerald-500/70',
  amber: 'bg-amber-500/5 border-amber-500/50 hover:border-amber-500/70',
  red: 'bg-red-500/5 border-red-500/50 hover:border-red-500/70',
  blue: 'bg-blue-500/5 border-blue-500/50 hover:border-blue-500/70',
  violet: 'bg-violet-500/5 border-violet-500/50 hover:border-violet-500/70',
  zinc: 'bg-zinc-500/5 border-zinc-500/50 hover:border-zinc-500/70',
};

export function getStatusConfig(status: string | null | undefined) {
  const s = status?.toLowerCase() ?? 'confirmed';
  return SHOW_STATUSES.find((x) => x.value === s) ?? SHOW_STATUSES[0];
}

export function getStatusCardClasses(status: string | null | undefined) {
  const config = getStatusConfig(status);
  return statusCardClasses[config.color] ?? statusCardClasses.emerald;
}
