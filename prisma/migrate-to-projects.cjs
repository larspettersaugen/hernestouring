/**
 * Migrates existing tours to the new Project structure.
 * Creates a default project and assigns all tours without projectId to it.
 * Run: node prisma/migrate-to-projects.cjs
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orphanTours = await prisma.tour.findMany({ where: { projectId: null } });
  if (orphanTours.length === 0) {
    console.log('No tours to migrate.');
    return;
  }

  const project = await prisma.project.create({
    data: { name: 'Migrated projects' },
  });

  await prisma.tour.updateMany({
    where: { projectId: null },
    data: { projectId: project.id },
  });

  console.log(`Migrated ${orphanTours.length} tour(s) to project "${project.name}"`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
