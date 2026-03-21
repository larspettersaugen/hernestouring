import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PeoplePageTabs } from '@/components/PeoplePageTabs';
import { canEdit } from '@/lib/session';
import { getBetaJoinSecret, isBetaJoinEnabled } from '@/lib/beta-join';
import { getPublicAppBaseUrl } from '@/lib/public-app-url';

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session?.user) redirect('/login');
  if ((session.user as { role?: string }).role === 'viewer') redirect('/dashboard');

  const { tab } = await searchParams;
  const initialTab = tab === 'groups' ? 'groups' : 'people';

  const peopleRaw = await prisma.person.findMany({
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
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
    },
  });
  const people = peopleRaw.map((p) => ({
    ...p,
    birthdate: p.birthdate?.toISOString() ?? null,
  }));

  const allowEdit = canEdit((session.user as { role?: string }).role);

  let betaJoinUrl: string | null = null;
  if (allowEdit && isBetaJoinEnabled()) {
    const h = headers();
    const base = getPublicAppBaseUrl((name) => h.get(name));
    const secret = getBetaJoinSecret()!;
    betaJoinUrl = `${base}/join/${encodeURIComponent(secret)}`;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 lg:p-8 pb-8">
      <h1 className="text-xl font-bold text-white mb-6">People</h1>
      <PeoplePageTabs
        initialPeople={people}
        allowEdit={allowEdit}
        initialTab={initialTab}
        betaJoinUrl={betaJoinUrl}
      />
    </div>
  );
}
