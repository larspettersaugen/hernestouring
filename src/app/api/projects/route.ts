import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { canEdit } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { tours: true } } },
  });
  return NextResponse.json(
    projects.map((p) => ({
      id: p.id,
      name: p.name,
      tourCount: p._count.tours,
    }))
  );
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canEdit((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json();
  const { name } = body;
  if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 });
  const project = await prisma.project.create({
    data: { name: name.trim() },
  });
  return NextResponse.json({ id: project.id });
}
