import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { canEdit } from '@/lib/session';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { groupId } = await params;
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: {
          person: {
            select: {
              id: true,
              name: true,
              type: true,
              phone: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    id: group.id,
    name: group.name,
    members: group.members.map((m) => ({
      id: m.id,
      personId: m.person.id,
      name: m.person.name,
      type: m.person.type,
      phone: m.person.phone,
      email: m.person.email,
      role: m.role,
      subgroup: m.subgroup,
    })),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEdit((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { groupId } = await params;
  const body = await req.json();
  const { name } = body;
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const group = await prisma.group.update({
    where: { id: groupId },
    data: { name: name.trim() },
  });

  return NextResponse.json({ id: group.id, name: group.name });
}

export async function DELETE(_req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(
    { error: 'Deletion is disabled. Work is never removed from the app.' },
    { status: 403 }
  );
}
