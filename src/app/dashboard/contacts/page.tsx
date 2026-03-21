import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { ContactsContent } from '@/components/ContactsContent';
import { canEdit } from '@/lib/session';

export default async function ContactsPage() {
  const session = await getSession();
  if (!session?.user) redirect('/login');
  if ((session.user as { role?: string }).role === 'viewer') redirect('/dashboard');

  const contacts = await prisma.venueContact.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      role: true,
      phone: true,
      email: true,
      notes: true,
    },
  });

  const allowEdit = canEdit((session.user as { role?: string }).role);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 lg:p-8 pb-8">
      <h1 className="text-xl font-bold text-white mb-6">Venue contacts</h1>
      <ContactsContent initialContacts={contacts} allowEdit={allowEdit} />
    </div>
  );
}
