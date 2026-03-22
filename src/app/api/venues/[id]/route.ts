import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { canEdit } from '@/lib/session';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const venue = await prisma.venue.findUnique({
    where: { id },
    select: { id: true, name: true, city: true, address: true, notes: true },
  });
  if (!venue) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(venue);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEdit((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const data: { name?: string; city?: string; address?: string | null; notes?: string | null } = {};
  if (body.name != null) {
    const n = String(body.name).trim();
    if (!n) return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 });
    data.name = n;
  }
  if (body.city != null) {
    const c = String(body.city).trim();
    if (!c) return NextResponse.json({ error: 'city cannot be empty' }, { status: 400 });
    data.city = c;
  }
  if (body.address !== undefined) data.address = body.address?.trim() || null;
  if (body.notes !== undefined) data.notes = body.notes?.trim() || null;
  const venue = await prisma.venue.update({
    where: { id },
    data,
  });
  return NextResponse.json({
    id: venue.id,
    name: venue.name,
    city: venue.city,
    address: venue.address,
    notes: venue.notes,
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEdit((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  await prisma.venue.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
