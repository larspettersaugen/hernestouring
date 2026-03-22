import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { hashResetToken } from '@/lib/password-reset';

const MIN_PASSWORD_LEN = 10;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { token?: string; password?: string };
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!token || !password) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    if (password.length < MIN_PASSWORD_LEN) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LEN} characters` },
        { status: 400 }
      );
    }

    const tokenHash = hashResetToken(token);
    const row = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, userId: true },
    });

    if (!row) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired. Request a new one from the login page.' },
        { status: 400 }
      );
    }

    const hashed = await hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: row.userId },
        data: { password: hashed },
      }),
      prisma.passwordResetToken.updateMany({
        where: { userId: row.userId, usedAt: null },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[reset-password]', e);
    return NextResponse.json({ error: 'Could not reset password' }, { status: 500 });
  }
}
