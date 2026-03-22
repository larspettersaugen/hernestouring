'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

type DateItem = { id: string; date: string; venueName: string; city: string };

export function DatePicker({
  dates,
  selectedDateId,
  tourId,
}: {
  dates: DateItem[];
  selectedDateId: string | null;
  tourId: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-zinc-400 flex items-center gap-2">
          <Calendar className="h-4 w-4" /> {dates.length > 1 ? 'Switch date' : 'Date'}
        </p>
        <Link
          href={`/dashboard/tours/${tourId}`}
          className="text-xs text-stage-muted hover:text-stage-accent"
        >
          All dates →
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 safe-bottom">
        {dates.map((d) => {
          const isSelected = d.id === selectedDateId;
          return (
            <Link
              key={d.id}
              href={`/dashboard/tours/${tourId}/dates/${d.id}`}
              className={`
                flex-shrink-0 px-4 py-2.5 rounded-lg border text-sm whitespace-nowrap
                ${isSelected ? 'bg-stage-accent border-stage-accent text-stage-accentFg font-medium' : 'bg-stage-card border-stage-border text-stage-muted hover:text-stage-fg hover:border-stage-muted'}
              `}
            >
              {format(new Date(d.date), 'EEE M/d')} · {d.city}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
