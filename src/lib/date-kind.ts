/** Date kind values – what type of date/show it is */
export const DATE_KINDS = [
  { value: 'concert', label: 'Concert' },
  { value: 'event', label: 'Event' },
  { value: 'travelday', label: 'Travel day' },
  { value: 'preproduction', label: 'Preproduction' },
  { value: 'rehearsal', label: 'Rehearsal' },
] as const;

export type DateKindValue = (typeof DATE_KINDS)[number]['value'];

export function getDateKindLabel(kind: string | null | undefined): string {
  const k = kind?.toLowerCase() ?? 'concert';
  return DATE_KINDS.find((x) => x.value === k)?.label ?? 'Concert';
}
