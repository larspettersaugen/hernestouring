'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleDot } from 'lucide-react';
import { api } from '@/lib/api';

export type TourAdvanceCompleteDateOption = {
  id: string;
  label: string;
  advanceComplete: boolean;
  ready: boolean;
};

/**
 * Inline tour-level control (no modal): pick a date, mark advance complete when requirements are met.
 * Shown for roles with `canEditAdvance` (admin, editor, power_user).
 */
export function TourAdvanceCompleteBar({
  tourId,
  dates,
}: {
  tourId: string;
  dates: TourAdvanceCompleteDateOption[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const selected = dates.find((d) => d.id === selectedId);
  const canCheckOn = Boolean(selected?.ready && !selected.advanceComplete);
  const alreadyDone = Boolean(selected?.advanceComplete);
  const checkboxDisabled =
    busy || !selectedId || (!alreadyDone && Boolean(selected && !selected.ready));

  let buttonTitle = '';
  if (!selectedId) buttonTitle = 'Select a date first';
  else if (alreadyDone) buttonTitle = 'Uncheck to clear advance complete for this date';
  else if (selected && !selected.ready) {
    buttonTitle =
      'All four advance sections must be marked Done and every task for this date must be completed first';
  } else buttonTitle = 'Check to mark advance complete for this date';

  async function setComplete(complete: boolean) {
    if (!selectedId) return;
    setError('');
    setBusy(true);
    try {
      await api.dates.setAdvanceComplete(tourId, selectedId, complete);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="flex flex-col gap-2 rounded-lg border border-stage-border bg-stage-card/80 px-3 py-2.5 sm:min-w-[280px]"
      role="region"
      aria-label="Mark advance complete for a date"
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stage-muted">
        <CircleDot className="h-3.5 w-3.5 text-emerald-500/80 shrink-0" aria-hidden />
        Advance complete
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="advance-complete-date">
            Date
          </label>
          <select
            id="advance-complete-date"
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setError('');
            }}
            className="flex-1 min-w-0 rounded-md border-2 border-stage-border bg-stage-surface px-2.5 py-2 text-sm text-stage-fg"
          >
            <option value="">Choose date…</option>
            {dates.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
                {d.advanceComplete ? ' ✓' : ''}
              </option>
            ))}
          </select>
        </div>
        <label
          className={`flex items-start gap-3 rounded-md border-2 border-stage-border bg-stage-surface px-3 py-2.5 ${
            !checkboxDisabled ? 'cursor-pointer hover:border-emerald-500/40' : 'cursor-default'
          } ${alreadyDone && selectedId ? 'border-emerald-500/40 bg-emerald-500/5' : ''}`}
        >
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-stage-fg/40 text-emerald-600 accent-emerald-600 focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-stage-card disabled:opacity-45"
            checked={Boolean(selectedId && alreadyDone)}
            disabled={checkboxDisabled}
            title={buttonTitle}
            onChange={(e) => {
              const on = e.target.checked;
              if (!selectedId) return;
              if (on && canCheckOn) void setComplete(true);
              if (!on && alreadyDone) void setComplete(false);
            }}
          />
          <span className="text-sm text-stage-fg leading-snug">
            <span className="font-medium">Advance complete</span>
            <span className="block text-xs text-stage-muted mt-0.5">
              {alreadyDone && selectedId
                ? 'Green light is on — uncheck to clear.'
                : !selectedId
                  ? 'Pick a date above, then tick here when all advance Done + tasks are finished.'
                  : !selected?.ready
                    ? 'Not ready yet — finish all four advance Done checkboxes and every task for this date.'
                    : 'Tick to turn on the green light for this date.'}
            </span>
          </span>
        </label>
      </div>
      <p className="text-[11px] leading-snug text-stage-muted">
        Checking requires all advance <strong className="text-stage-fg/80">Done</strong> and{' '}
        <strong className="text-stage-fg/80">tasks</strong> finished. You can uncheck anytime to remove the green light.
      </p>
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
