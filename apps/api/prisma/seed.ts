import { PrismaClient } from '@prisma/client';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create users
  const salt = randomBytes(16).toString('hex');
  const hashedPassword = (await scryptAsync('password123', salt, 64)) as Buffer;
  const hashedPasswordString = salt + ':' + hashedPassword.toString('hex');

  const csoUser = await prisma.user.upsert({
    where: { email: 'cso@example.com' },
    update: {},
    create: {
      email: 'cso@example.com',
      password: hashedPasswordString,
      role: 'CSO',
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      password: hashedPasswordString,
      role: 'MANAGER',
    },
  });

  // Create sample customers
  const customer1 = await prisma.customer.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      address: '123 Main St, City, State 12345',
      tags: ['vip', 'newsletter'],
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+0987654321',
      address: '456 Oak Ave, City, State 67890',
      tags: ['premium'],
    },
  });

  // Create sample feedback
  const feedback1 = await prisma.feedback.create({
    data: {
      customerId: customer1.id,
      message: 'I need help with my account settings. The interface is confusing.',
      channel: 'email',
    },
  });

  const feedback2 = await prisma.feedback.create({
    data: {
      customerId: customer2.id,
      message: 'Great service! Thank you for the quick response.',
      channel: 'phone',
    },
  });

  // Create sample replies
  await prisma.reply.create({
    data: {
      feedbackId: feedback1.id,
      content: 'Thank you for reaching out. I understand your concern about the interface. Let me help you navigate through the account settings.',
      status: 'DRAFT',
      submittedBy: csoUser.id,
    },
  });

  await prisma.reply.create({
    data: {
      feedbackId: feedback2.id,
      content: 'Thank you for your kind words! We appreciate your feedback and are glad we could help.',
      status: 'APPROVED',
      submittedBy: csoUser.id,
      reviewedBy: managerUser.id,
      reviewedAt: new Date(),
      comment: 'Approved - good response tone',
    },
  });

  // Create sample audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: csoUser.id,
        action: 'user.login',
        resource: `user:${csoUser.id}`,
        metadata: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0...' },
      },
      {
        actorId: managerUser.id,
        action: 'reply.approved',
        resource: `reply:${feedback2.id}`,
        metadata: { comment: 'Approved - good response tone' },
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log(`👤 Created users: ${csoUser.email}, ${managerUser.email}`);
  console.log(`👥 Created customers: ${customer1.name}, ${customer2.name}`);
  console.log(`💬 Created feedback and replies`);
  console.log(`📝 Created audit logs`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
