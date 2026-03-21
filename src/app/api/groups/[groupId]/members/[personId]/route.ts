import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { canEdit } from '@/lib/session';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ groupId: string; personId: string }> }
) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEdit((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { groupId, personId } = await params;
  const body = await req.json();
  const { subgroup } = body;

  const member = await prisma.groupMember.findFirst({
    where: { groupId, personId },
  });
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  const subgroupVal = subgroup !== undefined
    ? (subgroup && String(subgroup).trim() ? String(subgroup).trim() : null)
    : undefined;

  if (subgroupVal === undefined) return NextResponse.json({ error: 'subgroup required' }, { status: 400 });

  const updated = await prisma.groupMember.update({
    where: { id: member.id },
    data: { subgroup: subgroupVal },
  });

  return NextResponse.json({ id: updated.id, subgroup: updated.subgroup });
}

export async function DELETE(_req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(
    { error: 'Deletion is disabled. Work is never removed from the app.' },
    { status: 403 }
  );
}
