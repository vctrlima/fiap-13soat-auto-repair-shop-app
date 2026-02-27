import { PrismaClient } from '@prisma/client';
import { BcryptAdapter } from '../src/infra/cryptography';
import env from '../src/main/config/env';

const prisma = new PrismaClient();

async function main() {
  const bcryptAdapter = new BcryptAdapter(env.passwordHashSalt);
  await prisma.user.upsert({
    where: { email: 'admin@email.com' },
    update: {},
    create: {
      email: 'admin@email.com',
      name: 'Admin',
      password: await bcryptAdapter.hash('@Abc1234'),
      role: 'ADMIN',
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
