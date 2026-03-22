import { prisma } from '@/lib/prisma';

/**
 * Removes tour members that are not in the People database.
 * Deletes TravelGroupMembers where personId is null or the Person no longer exists.
 * Cascades to TourDateMember, FlightPassenger, TransportPassenger, HotelGuest.
 *
 * Call from the tour overview page and traveling-group API — not on every date subpage (latency).
 */
export async function cleanupOrphanedTravelGroupMembers(tourId: string): Promise<number> {
  const members = await prisma.travelGroupMember.findMany({
    where: { tourId },
    select: { id: true, personId: true },
  });
  const toDelete: string[] = [];
  const personIds = Array.from(new Set(members.map((m) => m.personId).filter((id): id is string => !!id)));
  const existingPersonIds = personIds.length
    ? new Set((await prisma.person.findMany({ where: { id: { in: personIds } }, select: { id: true } })).map((p) => p.id))
    : new Set<string>();
  for (const m of members) {
    if (!m.personId || !existingPersonIds.has(m.personId)) toDelete.push(m.id);
  }
  if (toDelete.length === 0) return 0;
  await prisma.travelGroupMember.deleteMany({ where: { id: { in: toDelete } } });
  return toDelete.length;
}
