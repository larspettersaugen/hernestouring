import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ tourId: string }> }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { tourId } = await params;
  const dates = await prisma.tourDate.findMany({
    where: { tourId },
    orderBy: { date: 'asc' },
  });
  return NextResponse.json(
    dates.map((d) => ({
      id: d.id,
      venueName: d.venueName,
      city: d.city,
      date: d.date.toISOString(),
      endDate: d.endDate?.toISOString() ?? null,
      kind: d.kind,
      status: d.status,
      address: d.address,
      timezone: d.timezone,
    }))
  );
}

export async function POST(req: Request, { params }: { params: Promise<{ tourId: string }> }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== 'admin' && role !== 'editor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { tourId } = await params;
  const body = await req.json();
  const { venueName, city, date, endDate, address, timezone, status, kind } = body;
  if (!venueName || !city || !date) {
    return NextResponse.json({ error: 'venueName, city, date required' }, { status: 400 });
  }
  const validStatuses = ['confirmed', 'tbc', 'cancelled', 'pitch', 'opportunity', 'lost_pitch'];
  const resolvedStatus = status && validStatuses.includes(status) ? status : 'confirmed';
  const validKinds = ['concert', 'event', 'travelday', 'preproduction', 'rehearsal'];
  const resolvedKind = kind && validKinds.includes(kind) ? kind : 'concert';
  const { getTimezoneFromCity } = await import('@/lib/timezone');
  const resolvedTimezone = timezone || getTimezoneFromCity(city) || null;
  const needsEndDate = resolvedKind === 'preproduction' || resolvedKind === 'rehearsal';
  const tourDate = await prisma.tourDate.create({
    data: {
      tourId,
      venueName,
      city,
      date: new Date(date),
      endDate: needsEndDate && endDate ? new Date(endDate) : null,
      kind: resolvedKind,
      status: resolvedStatus,
      address: address || null,
      timezone: resolvedTimezone,
    },
  });
  return NextResponse.json({ id: tourDate.id });
}
