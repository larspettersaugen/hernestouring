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
  const contact = await prisma.venueContact.findUnique({
    where: { id },
    select: { id: true, name: true, role: true, phone: true, email: true, notes: true },
  });
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(contact);
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
  const data: { name?: string; role?: string; phone?: string; email?: string; notes?: string } = {};
  if (body.name != null) data.name = body.name.trim();
  if (body.role != null) data.role = body.role.trim() || 'Contact';
  if (body.phone != null) data.phone = body.phone?.trim() || null;
  if (body.email != null) data.email = body.email?.trim() || null;
  if (body.notes != null) data.notes = body.notes?.trim() || null;
  const contact = await prisma.venueContact.update({
    where: { id },
    data,
  });
  return NextResponse.json({ id: contact.id, name: contact.name, role: contact.role, phone: contact.phone, email: contact.email, notes: contact.notes });
}

export async function DELETE(_req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(
    { error: 'Deletion is disabled. Work is never removed from the app.' },
    { status: 403 }
  );
}
