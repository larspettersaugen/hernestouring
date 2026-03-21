import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { canEdit } from '@/lib/session';

const PERSON_TYPES = ['musician', 'superstar', 'crew', 'tour_manager', 'productionmanager', 'driver'] as const;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ personId: string }> }
) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { personId } = await params;
  const person = await prisma.person.findUnique({
    where: { id: personId },
    select: {
      id: true,
      name: true,
      type: true,
      birthdate: true,
      phone: true,
      email: true,
      streetName: true,
      zipCode: true,
      county: true,
      timezone: true,
      notes: true,
      userId: true,
      user: { select: { role: true } },
    },
  });
  if (!person) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { user, ...rest } = person;
  return NextResponse.json({
    ...rest,
    timezone: person.timezone,
    isPowerUser: user ? (user.role === 'power_user' || user.role === 'editor' || user.role === 'admin') : false,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ personId: string }> }
) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEdit((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { personId } = await params;
  if (!personId?.trim()) return NextResponse.json({ error: 'Person ID required' }, { status: 400 });
  const existing = await prisma.person.findUnique({ where: { id: personId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await req.json();
  const { name, type, birthdate, phone, email, streetName, zipCode, county, timezone, notes, userId, isPowerUser } = body;
  const data: { name?: string; type?: string; birthdate?: Date | null; phone?: string | null; email?: string | null; streetName?: string | null; zipCode?: string | null; county?: string | null; timezone?: string | null; notes?: string | null; userId?: string | null } = {};
  if (name !== undefined) data.name = name;
  if (type !== undefined) {
    if (!PERSON_TYPES.includes(type)) {
      return NextResponse.json({ error: `type must be one of: ${PERSON_TYPES.join(', ')}` }, { status: 400 });
    }
    data.type = type;
  }
  if (birthdate !== undefined) data.birthdate = birthdate ? new Date(birthdate) : null;
  if (phone !== undefined) data.phone = phone || null;
  if (email !== undefined) data.email = email || null;
  if (streetName !== undefined) data.streetName = streetName || null;
  if (zipCode !== undefined) data.zipCode = zipCode || null;
  if (county !== undefined) data.county = county || null;
  if (timezone !== undefined) data.timezone = timezone || null;
  if (notes !== undefined) data.notes = notes || null;
  if (userId !== undefined) data.userId = userId || null;
  try {
    const person = await prisma.person.update({
      where: { id: personId },
      data,
      include: { user: { select: { id: true, role: true } } },
    });
    let resolvedPowerUser = person.user ? (person.user.role === 'power_user' || person.user.role === 'editor' || person.user.role === 'admin') : false;
    if (isPowerUser !== undefined && person.userId && person.user) {
      const currentRole = person.user.role;
      if (currentRole !== 'editor' && currentRole !== 'admin') {
        await prisma.user.update({
          where: { id: person.user.id },
          data: { role: isPowerUser ? 'power_user' : 'viewer' },
        });
        resolvedPowerUser = !!isPowerUser;
      } else {
        resolvedPowerUser = true;
      }
    }
    return NextResponse.json({
      id: person.id,
      name: person.name,
      type: person.type,
      phone: person.phone,
      email: person.email,
      streetName: person.streetName,
      zipCode: person.zipCode,
      county: person.county,
      timezone: person.timezone,
      notes: person.notes,
      isPowerUser: resolvedPowerUser,
    });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    throw err;
  }
}

export async function DELETE(_req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(
    { error: 'Deletion is disabled. Work is never removed from the app.' },
    { status: 403 }
  );
}
