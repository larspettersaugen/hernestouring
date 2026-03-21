import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getTimezoneFromCity } from '@/lib/timezone';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city');
  if (!city?.trim()) return NextResponse.json({ timezone: null });
  const timezone = getTimezoneFromCity(city);
  return NextResponse.json({ timezone });
}
