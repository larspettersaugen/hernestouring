import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateInfo } from '@/components/DateInfo';
import { DateNavTabs } from '@/components/DateNavTabs';
import { TasksContent } from '@/components/TasksContent';
import { canEdit, canAccessAdvance, canEditAdvance } from '@/lib/session';
import { isReadyForAdvanceComplete } from '@/lib/advance-complete';

export default async function DateTasksPage({
  params,
}: {
  params: Promise<{ tourId: string; dateId: string }>;
}) {
  const session = await getSession();
  if (!session?.user) redirect('/login');
  const { tourId, dateId } = await params;

  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    include: { dates: { orderBy: { date: 'asc' } } },
  });
  if (!tour) redirect('/dashboard');

  const selectedDate = tour.dates.find((d) => d.id === dateId);
  if (!selectedDate) redirect(`/dashboard/tours/${tourId}`);

  const role = (session.user as { role?: string }).role;
  const allowEditTourMeta = canEdit(role);
  const allowAdvance = canAccessAdvance(role);
  const allowTaskEdit = canEditAdvance(role);

  const [contacts, travelingGroup, taskRows, advanceForComplete] = await Promise.all([
    prisma.contact.findMany({
      where: { tourId, OR: [{ tourDateId: null }, { tourDateId: dateId }] },
      orderBy: { name: 'asc' },
    }),
    prisma.travelGroupMember.findMany({
      where: { tourId },
      orderBy: { name: 'asc' },
    }),
    prisma.tourDateTask.findMany({
      where: { tourDateId: dateId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.advance.findUnique({ where: { tourDateId: dateId } }),
  ]);
  const advanceReady = isReadyForAdvanceComplete(advanceForComplete, taskRows);
  const initialTasks = taskRows.map((t) => ({
    id: t.id,
    title: t.title,
    done: t.done,
    sortOrder: t.sortOrder,
    createdAt: t.createdAt.toISOString(),
  }));

  const currentIndex = tour.dates.findIndex((d) => d.id === dateId);
  const prevDate = currentIndex > 0 ? tour.dates[currentIndex - 1] : null;
  const nextDate = currentIndex >= 0 && currentIndex < tour.dates.length - 1 ? tour.dates[currentIndex + 1] : null;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 lg:p-8 pb-24 lg:pb-8">
      <div className="flex items-center justify-between gap-4 mb-4 print:hidden">
        <Link
          href={`/dashboard/tours/${tourId}`}
          className="inline-flex items-center gap-2 text-stage-muted hover:text-stage-fg"
        >
          <ArrowLeft className="h-4 w-4" /> {tour.name}
        </Link>
        {(prevDate || nextDate) && (
          <nav className="flex items-center gap-3">
            {prevDate && (
              <Link
                href={`/dashboard/tours/${tourId}/dates/${prevDate.id}/tasks`}
                className="flex items-center gap-1.5 text-stage-muted hover:text-stage-fg transition text-sm"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Link>
            )}
            {nextDate && (
              <Link
                href={`/dashboard/tours/${tourId}/dates/${nextDate.id}/tasks`}
                className="flex items-center gap-1.5 text-stage-muted hover:text-stage-fg transition text-sm"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </nav>
        )}
      </div>

      <DateInfo
        tourId={tourId}
        dateId={dateId}
        venueName={selectedDate.venueName}
        city={selectedDate.city}
        date={selectedDate.date.toISOString()}
        endDate={selectedDate.endDate?.toISOString() ?? null}
        kind={selectedDate.kind}
        status={selectedDate.status}
        address={selectedDate.address}
        promoterName={selectedDate.promoterName}
        promoterPhone={selectedDate.promoterPhone}
        promoterEmail={selectedDate.promoterEmail}
        allowEdit={allowEditTourMeta}
        allowAdvanceComplete={allowTaskEdit}
        advanceComplete={selectedDate.advanceComplete}
        advanceReady={advanceReady}
        contacts={contacts}
        travelingGroup={travelingGroup.map((m) => ({
          id: m.id,
          name: m.name,
          role: m.role,
          subgroup: m.subgroup,
          phone: m.phone,
          email: m.email,
        }))}
        hideAllTourMessage={role === 'viewer'}
      />

      <DateNavTabs tourId={tourId} dateId={dateId} active="tasks" allowAdvance={allowAdvance} />

      <div className="rounded-xl bg-stage-card border border-stage-border p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Tasks</h2>
        <p className="text-stage-muted text-sm mb-6">
          Quick checklist for this date (calls, parking, reminders). Viewers can see progress; power users and editors can add and complete tasks.
        </p>
        <TasksContent tourId={tourId} dateId={dateId} initialTasks={initialTasks} allowEdit={allowTaskEdit} />
      </div>
    </div>
  );
}
