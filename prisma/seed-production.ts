/**
 * Production Seed Script
 *
 * This script is designed to run in the production container without
 * dependency on path aliases (@/) that may not resolve correctly.
 * It creates the default admin user if it doesn't exist.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHashSalt = Number(process.env.PASSWORD_HASH_SALT) || 10;
  const hashedPassword = await bcrypt.hash('@Abc1234', passwordHashSalt);

  await prisma.user.upsert({
    where: { email: 'admin@email.com' },
    update: {},
    create: {
      email: 'admin@email.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created/verified successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
