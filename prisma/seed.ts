import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lia.dev' },
    update: {},
    create: {
      email: 'admin@lia.dev',
      username: 'admin',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@lia.dev' },
    update: {},
    create: {
      email: 'demo@lia.dev',
      username: 'demo',
      password: demoPassword,
      name: 'Demo User',
      role: 'USER',
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create sample collections
  const workCollection = await prisma.collection.create({
    data: {
      userId: demoUser.id,
      name: 'Work',
      description: 'Work-related bookmarks',
      icon: '💼',
      color: '#3b82f6',
    },
  });

  const personalCollection = await prisma.collection.create({
    data: {
      userId: demoUser.id,
      name: 'Personal',
      description: 'Personal bookmarks',
      icon: '🏠',
      color: '#10b981',
    },
  });

  console.log('✅ Created sample collections');

  // Create sample tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        userId: demoUser.id,
        name: 'important',
        color: '#ef4444',
        isPinned: true,
      },
    }),
    prisma.tag.create({
      data: {
        userId: demoUser.id,
        name: 'to-read',
        color: '#f59e0b',
      },
    }),
    prisma.tag.create({
      data: {
        userId: demoUser.id,
        name: 'tutorial',
        color: '#8b5cf6',
      },
    }),
  ]);

  console.log('✅ Created sample tags');

  // Create sample bookmarks
  const bookmark1 = await prisma.bookmark.create({
    data: {
      userId: demoUser.id,
      collectionId: workCollection.id,
      url: 'https://github.com',
      title: 'GitHub',
      description: 'Where the world builds software',
      favicon: 'https://github.com/favicon.ico',
      isPinned: true,
    },
  });

  await prisma.bookmarkTag.create({
    data: {
      bookmarkId: bookmark1.id,
      tagId: tags[0].id,
    },
  });

  const bookmark2 = await prisma.bookmark.create({
    data: {
      userId: demoUser.id,
      collectionId: workCollection.id,
      url: 'https://react.dev',
      title: 'React',
      description: 'The library for web and native user interfaces',
      favicon: 'https://react.dev/favicon.ico',
    },
  });

  await prisma.bookmarkTag.create({
    data: {
      bookmarkId: bookmark2.id,
      tagId: tags[2].id,
    },
  });

  console.log('✅ Created sample bookmarks');

  console.log('\n🎉 Seeding completed!');
  console.log('\n📝 Login credentials:');
  console.log('Admin: admin@lia.dev / admin123');
  console.log('Demo:  demo@lia.dev / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
