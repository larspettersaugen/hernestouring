import Link from 'next/link';
import { Calendar, FileText, FolderOpen, ListTodo } from 'lucide-react';

export function DateNavTabs({
  tourId,
  dateId,
  active,
  allowAdvance = true,
}: {
  tourId: string;
  dateId: string;
  active: 'day' | 'advance' | 'files' | 'tasks';
  allowAdvance?: boolean;
}) {
  const base = `/dashboard/tours/${tourId}/dates/${dateId}`;
  return (
    <nav className="flex gap-1 mb-6 print:hidden">
      <Link
        href={base}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
          active === 'day'
            ? 'bg-stage-accent text-stage-accentFg'
            : 'text-stage-muted hover:text-stage-fg hover:bg-stage-card border border-stage-border'
        }`}
      >
        <Calendar className="h-4 w-4" /> Day
      </Link>
      {allowAdvance && (
      <Link
        href={`${base}/advance`}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
          active === 'advance'
            ? 'bg-stage-accent text-stage-accentFg'
            : 'text-stage-muted hover:text-stage-fg hover:bg-stage-card border border-stage-border'
        }`}
      >
        <FileText className="h-4 w-4" /> Advance
      </Link>
      )}
      <Link
        href={`${base}/tasks`}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
          active === 'tasks'
            ? 'bg-stage-accent text-stage-accentFg'
            : 'text-stage-muted hover:text-stage-fg hover:bg-stage-card border border-stage-border'
        }`}
      >
        <ListTodo className="h-4 w-4" /> Tasks
      </Link>
      <Link
        href={`${base}/files`}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
          active === 'files'
            ? 'bg-stage-accent text-stage-accentFg'
            : 'text-stage-muted hover:text-stage-fg hover:bg-stage-card border border-stage-border'
        }`}
      >
        <FolderOpen className="h-4 w-4" /> Files
      </Link>
    </nav>
  );
}
