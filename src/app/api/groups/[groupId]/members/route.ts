import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { canEdit } from '@/lib/session';

export async function POST(
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
  const { personId, role = 'crew', subgroup } = body;
  if (!personId) return NextResponse.json({ error: 'personId required' }, { status: 400 });

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });

  const person = await prisma.person.findUnique({ where: { id: personId } });
  if (!person) return NextResponse.json({ error: 'Person not found' }, { status: 404 });

  const subgroupVal = subgroup && String(subgroup).trim() ? String(subgroup).trim() : null;

  try {
    const member = await prisma.groupMember.create({
      data: {
        groupId,
        personId,
        role,
        subgroup: subgroupVal,
      },
    });
    return NextResponse.json({
      id: member.id,
      personId: person.id,
      name: person.name,
      type: person.type,
      phone: person.phone,
      email: person.email,
      role: member.role,
      subgroup: member.subgroup,
    });
  } catch (err) {
    // Unique constraint - person already in group
    return NextResponse.json({ error: 'Person already in group' }, { status: 400 });
  }
}
