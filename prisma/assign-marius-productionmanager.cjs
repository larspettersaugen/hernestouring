/**
 * One-time script: Set Marius Karlsen's type to productionmanager.
 * Run: node prisma/assign-marius-productionmanager.cjs
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.person.updateMany({
    where: {
      OR: [
        { email: 'marius@stgroup.no' },
        { name: { contains: 'Marius Karlsen' } },
      ],
    },
    data: { type: 'productionmanager' },
  });
  console.log('Updated', updated.count, 'person(s) to productionmanager.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
