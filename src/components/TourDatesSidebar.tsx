'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { AdvanceCompleteGreenLight } from '@/components/AdvanceCompleteGreenLight';
import { format } from 'date-fns';
import { useTourDatesSidebar } from '@/contexts/TourDatesSidebarContext';
import { getDateKindLabel } from '@/lib/date-kind';

type TourDate = {
  id: string;
  venueName: string;
  city: string;
  date: string;
  endDate?: string | null;
  kind?: string | null;
  address: string | null;
  advanceComplete?: boolean;
};

export function TourDatesSidebar({
  tourId,
  tourName,
  dates,
}: {
  tourId: string;
  tourName: string;
  dates: TourDate[];
}) {
  const tourDatesSidebar = useTourDatesSidebar();
  const collapsed = tourDatesSidebar?.rightSidebarCollapsed ?? false;
  const setCollapsed = tourDatesSidebar?.setRightSidebarCollapsed ?? (() => {});
  const pathname = usePathname();
  const currentDateId = pathname.match(/\/dates\/([^/]+)/)?.[1] ?? null;

  return (
    <div
      className={`hidden lg:flex lg:fixed lg:top-0 lg:bottom-0 lg:right-0 lg:z-20 lg:flex-col transition-[width] duration-200 shrink-0 ${
        collapsed ? 'lg:w-[4.5rem]' : 'lg:w-64'
      }`}
    >
        <aside
          className="flex flex-col h-full min-h-0 overflow-hidden border-l border-stage-border bg-stage-card w-full"
          aria-label="Tour dates"
        >
          <div
            className={`shrink-0 border-b border-stage-border flex items-center ${collapsed ? 'p-3 justify-center' : 'p-4'}`}
          >
            <div
              className={`flex items-center text-white font-semibold ${collapsed ? 'justify-center' : 'gap-2 truncate'}`}
            >
              <Calendar className="h-6 w-6 shrink-0 text-stage-accent" />
              {!collapsed && <span className="truncate">{tourName}</span>}
            </div>
          </div>
          <nav
            className={`flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 ${collapsed ? 'p-2 items-center' : 'p-3'}`}
          >
            {dates.map((date) => {
              const href = `/dashboard/tours/${tourId}/dates/${date.id}`;
              const isActive = date.id === currentDateId;
              return (
                <Link
                  key={date.id}
                  href={href}
                  title={
                    collapsed
                      ? `${date.advanceComplete ? 'Advance complete (green light) · ' : ''}${getDateKindLabel(date.kind)}: ${date.venueName}, ${date.city}`
                      : undefined
                  }
                  className={`flex items-center rounded-lg text-sm transition shrink-0 ${
                    collapsed ? 'p-2.5 justify-center' : 'gap-3 px-3 py-2.5'
                  } ${
                    isActive ? 'bg-stage-surface text-white' : 'text-stage-muted hover:text-stage-fg hover:bg-stage-surface/50'
                  }`}
                >
                  {!collapsed ? (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate flex items-center gap-1.5 min-w-0">
                          <span className="truncate">
                            {date.venueName}, {date.city}
                          </span>
                          {date.advanceComplete ? (
                            <span className="shrink-0 pt-0.5" title="Advance complete">
                              <AdvanceCompleteGreenLight />
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-stage-muted truncate">
                          {getDateKindLabel(date.kind)} · {date.endDate
                            ? `${format(new Date(date.date), 'EEE MMM d')} – ${format(new Date(date.endDate), 'EEE MMM d')}`
                            : format(new Date(date.date), 'EEE MMM d')}
                        </p>
                      </div>
                      {isActive && <span className="text-stage-accent">•</span>}
                    </>
                  ) : (
                    <span className="text-xs font-medium w-6 text-center flex flex-col items-center gap-0.5">
                      <span>{format(new Date(date.date), 'd')}</span>
                      {date.advanceComplete ? (
                        <AdvanceCompleteGreenLight className="scale-90" label="Advance complete" />
                      ) : null}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -left-4 bottom-8 z-10 h-10 w-10 flex items-center justify-center rounded-full border-2 border-stage-border bg-stage-card text-stage-muted hover:text-stage-accent hover:border-stage-accent hover:bg-stage-surface shadow-lg"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelRightOpen className="h-5 w-5" /> : <PanelRightClose className="h-5 w-5" />}
        </button>
      </div>
  );
}
