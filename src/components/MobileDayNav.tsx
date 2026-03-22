'use client';

import { usePathname } from 'next/navigation';
import { Clock, Plane } from 'lucide-react';

const tabs = [
  { id: 'schedule', label: 'Schedule', icon: Clock },
  { id: 'travel', label: 'Travel', icon: Plane },
];

export function MobileDayNav() {
  const pathname = usePathname();
  const isTourDayPage =
    /^\/dashboard\/tours\/[^/]+\/dates\/[^/]+$/.test(pathname) && !pathname.endsWith('/dates/new');
  if (!isTourDayPage) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stage-card border-t border-stage-border safe-bottom"
      aria-label="Jump to section"
    >
      <div className="flex justify-around py-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-stage-muted hover:text-stage-accent hover:bg-stage-surface/50 min-w-0"
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="text-xs truncate max-w-[72px]">{label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
