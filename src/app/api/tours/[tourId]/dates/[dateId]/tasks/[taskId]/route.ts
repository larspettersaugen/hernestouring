import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { canEditAdvance } from '@/lib/session';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tourId: string; dateId: string; taskId: string }> }
) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditAdvance((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { tourId, dateId, taskId } = await params;
  const task = await prisma.tourDateTask.findFirst({
    where: { id: taskId, tourDateId: dateId },
  });
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const tourDate = await prisma.tourDate.findFirst({ where: { id: dateId, tourId } });
  if (!tourDate) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const data: { title?: string; done?: boolean; sortOrder?: number } = {};
  if ('title' in body) {
    const t = typeof body.title === 'string' ? body.title.trim() : '';
    if (!t) return NextResponse.json({ error: 'title cannot be empty' }, { status: 400 });
    data.title = t;
  }
  if (typeof body.done === 'boolean') data.done = body.done;
  if (typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder)) data.sortOrder = body.sortOrder;
  if (Object.keys(data).length === 0) return NextResponse.json({ ok: true });

  await prisma.tourDateTask.update({ where: { id: taskId }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ tourId: string; dateId: string; taskId: string }> }
) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEditAdvance((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { tourId, dateId, taskId } = await params;
  const task = await prisma.tourDateTask.findFirst({
    where: { id: taskId, tourDateId: dateId },
  });
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const tourDate = await prisma.tourDate.findFirst({ where: { id: dateId, tourId } });
  if (!tourDate) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.tourDateTask.delete({ where: { id: taskId } });
  return NextResponse.json({ ok: true });
}
