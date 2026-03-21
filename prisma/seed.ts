import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hash('admin123', 12);
  const editorPassword = await hash('editor123', 12);
  const viewerPassword = await hash('viewer123', 12);

  // Ensure demo users exist and have correct passwords (idempotent)
  await prisma.user.upsert({
    where: { email: 'admin@tour.local' },
    update: { password: adminPassword },
    create: { email: 'admin@tour.local', password: adminPassword, name: 'Admin', role: 'admin' },
  });
  await prisma.user.upsert({
    where: { email: 'editor@tour.local' },
    update: { password: editorPassword },
    create: { email: 'editor@tour.local', password: editorPassword, name: 'Editor', role: 'editor' },
  });
  await prisma.user.upsert({
    where: { email: 'viewer@tour.local' },
    update: { password: viewerPassword },
    create: { email: 'viewer@tour.local', password: viewerPassword, name: 'Viewer', role: 'viewer' },
  });

  // Delete existing demo tour so seed can be re-run safely
  await prisma.tour.deleteMany({ where: { name: 'Spring 2025 Tour' } });
  let demoProject = await prisma.project.findFirst({ where: { name: 'Demo Artist' } });
  if (!demoProject) {
    demoProject = await prisma.project.create({ data: { name: 'Demo Artist' } });
  }

  // Create sample people with profiles (each Person has a User)
  const peopleData = [
    { name: 'Alex Stage', type: 'musician', email: 'alex@band.local', phone: '+47 111 22 333' },
    { name: 'Jordan Crew', type: 'crew', email: 'jordan@crew.local', phone: '+47 222 33 444' },
    { name: 'Morgan Tour', type: 'tour_manager', email: 'morgan@tour.local', phone: '+47 333 44 555' },
    { name: 'Sam Driver', type: 'driver', email: 'sam@transport.local', phone: '+47 444 55 666' },
  ];
  for (const p of peopleData) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: { email: p.email, password: null, name: p.name, role: 'viewer' },
    });
    const existing = await prisma.person.findFirst({ where: { email: p.email } });
    if (existing) {
      await prisma.person.update({
        where: { id: existing.id },
        data: { userId: user.id },
      });
    } else {
      await prisma.person.create({
        data: {
          name: p.name,
          type: p.type,
          email: p.email,
          phone: p.phone,
          userId: user.id,
        },
      });
    }
  }

  const tour = await prisma.tour.create({
    data: {
      projectId: demoProject.id,
      name: 'Spring 2025 Tour',
      timezone: 'Europe/Oslo',
    },
  });

  const date1 = await prisma.tourDate.create({
    data: {
      tourId: tour.id,
      venueName: 'Rock Club',
      city: 'Oslo',
      date: new Date('2025-03-01'),
      address: 'Storgata 1',
    },
  });

  await prisma.scheduleItem.createMany({
    data: [
      { tourDateId: date1.id, time: '14:00', label: 'Load-in', notes: 'Back door', sortOrder: 0 },
      { tourDateId: date1.id, time: '16:00', label: 'Soundcheck', sortOrder: 1 },
      { tourDateId: date1.id, time: '19:00', label: 'Doors', sortOrder: 2 },
      { tourDateId: date1.id, time: '20:00', label: 'Show', sortOrder: 3 },
      { tourDateId: date1.id, time: '23:00', label: 'Load-out', sortOrder: 4 },
    ],
  });

  await prisma.flight.create({
    data: {
      tourId: tour.id,
      departureTime: new Date('2025-03-01T08:00:00'),
      arrivalTime: new Date('2025-03-01T10:30:00'),
      departureAirport: 'OSL',
      arrivalAirport: 'OSL',
      flightNumber: 'SK123',
    },
  });

  await prisma.transport.create({
    data: {
      tourDateId: date1.id,
      type: 'bus',
      time: '12:00',
      driver: 'John',
      company: 'Tour Bus Co',
      notes: 'Hotel pickup',
    },
  });

  await prisma.contact.create({
    data: {
      tourId: tour.id,
      tourDateId: date1.id,
      name: 'Venue Manager',
      role: 'venue',
      phone: '+47 123 45 678',
      email: 'venue@rockclub.no',
    },
  });

  console.log('Seed done. Login: admin@tour.local / admin123 (editor / editor123, viewer / viewer123)');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
