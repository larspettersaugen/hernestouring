const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const KEEP_EMAILS = ['admin@tour.local', 'editor@tour.local', 'viewer@tour.local'];

async function main() {
  const people = await prisma.person.findMany({ select: { userId: true }, where: { userId: { not: null } } });
  const userIds = [...new Set(people.map((p) => p.userId).filter(Boolean))];
  const usersToCheck = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true },
      })
    : [];
  const userIdsToDelete = usersToCheck.filter((u) => !KEEP_EMAILS.includes(u.email)).map((u) => u.id);

  await prisma.$transaction([
    prisma.invite.deleteMany(),
    prisma.travelGroupMember.updateMany({ data: { personId: null } }),
    prisma.contact.updateMany({ data: { personId: null } }),
    prisma.person.deleteMany(),
    ...userIdsToDelete.map((id) => prisma.user.delete({ where: { id } })),
  ]);

  const kept = await prisma.user.findMany({
    where: { email: { in: KEEP_EMAILS } },
    select: { email: true },
  });
  console.log('Cleared all people and their profiles.');
  console.log('Kept login accounts:', kept.map((u) => u.email).join(', '));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
