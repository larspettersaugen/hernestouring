import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { canEdit } from '@/lib/session';
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim() ?? '';
  const where: Prisma.VenueWhereInput =
    q.length > 0
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
            { address: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};
  const venues = await prisma.venue.findMany({
    where,
    orderBy: [{ city: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, city: true, address: true, notes: true },
  });
  return NextResponse.json(venues);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEdit((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json();
  const { name, city, address, notes } = body;
  if (!name?.trim() || !city?.trim()) {
    return NextResponse.json({ error: 'name and city required' }, { status: 400 });
  }
  const venue = await prisma.venue.create({
    data: {
      name: name.trim(),
      city: city.trim(),
      address: address?.trim() || null,
      notes: notes?.trim() || null,
    },
  });
  return NextResponse.json({
    id: venue.id,
    name: venue.name,
    city: venue.city,
    address: venue.address,
    notes: venue.notes,
  });
}
