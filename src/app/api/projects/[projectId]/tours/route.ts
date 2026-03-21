import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { canEdit } from '@/lib/session';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEdit((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  const body = await req.json();
  const { name, timezone = 'UTC', startDate, endDate } = body;
  if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 });
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  if (start && end && end < start) {
    return NextResponse.json({ error: 'End date cannot be before start date' }, { status: 400 });
  }
  const tour = await prisma.tour.create({
    data: {
      projectId,
      name: name.trim(),
      timezone,
      startDate: start ?? undefined,
      endDate: end ?? undefined,
    },
  });
  return NextResponse.json({ id: tour.id });
}
