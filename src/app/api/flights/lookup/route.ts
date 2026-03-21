import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const AVIATIONSTACK_KEY = process.env.AVIATIONSTACK_ACCESS_KEY;

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!AVIATIONSTACK_KEY) {
    return NextResponse.json(
      { error: 'Flight lookup not configured. Add AVIATIONSTACK_ACCESS_KEY to .env' },
      { status: 503 }
    );
  }

  const url = new URL(req.url);
  const flightNumber = url.searchParams.get('flight_number')?.trim();
  const date = url.searchParams.get('date')?.trim();

  if (!flightNumber) {
    return NextResponse.json({ error: 'flight_number required' }, { status: 400 });
  }

  // Normalize flight number: "SK 123" -> "SK123", "sk123" -> "SK123"
  const flightIata = flightNumber.replace(/\s+/g, '').toUpperCase();

  const params = new URLSearchParams({
    access_key: AVIATIONSTACK_KEY,
    flight_iata: flightIata,
    limit: '5',
  });
  if (date) params.set('flight_date', date);

  try {
    const res = await fetch(
      `https://api.aviationstack.com/v1/flights?${params.toString()}`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message || 'Flight lookup failed' },
        { status: 400 }
      );
    }

    const flights = data.data as Array<{
      departure?: { iata?: string; scheduled?: string };
      arrival?: { iata?: string; scheduled?: string };
      flight?: { iata?: string; number?: string };
    }>;

    if (!flights?.length) {
      return NextResponse.json({ error: 'No flight found for this number and date' }, { status: 404 });
    }

    const f = flights[0];
    const dep = f.departure;
    const arr = f.arrival;

    return NextResponse.json({
      departureAirport: dep?.iata || '',
      arrivalAirport: arr?.iata || '',
      departureTime: dep?.scheduled || null,
      arrivalTime: arr?.scheduled || null,
      flightNumber: f.flight?.iata || f.flight?.number || flightIata,
    });
  } catch (err) {
    console.error('[flights/lookup]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Flight lookup failed' },
      { status: 500 }
    );
  }
}
