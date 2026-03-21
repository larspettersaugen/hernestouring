import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { canEdit } from '@/lib/session';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tours: {
        orderBy: { startDate: 'asc' },
        include: { _count: { select: { dates: true } } },
      },
    },
  });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({
    id: project.id,
    name: project.name,
    tours: project.tours.map((t) => ({
      id: t.id,
      name: t.name,
      timezone: t.timezone,
      dateCount: t._count.dates,
    })),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEdit((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { projectId } = await params;
  const body = await req.json();
  const { name } = body;
  if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 });
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name: name.trim() },
  });
  return NextResponse.json({ id: project.id });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(
    { error: 'Deletion is disabled. Work is never removed from the app.' },
    { status: 403 }
  );
}
