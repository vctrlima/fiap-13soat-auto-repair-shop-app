import { DbUpdateUser } from '@/application/use-cases';
import { UpdateUser } from '@/domain/use-cases';
import { BcryptAdapter } from '@/infra/cryptography';
import { prisma, PrismaUserRepository } from '@/infra/db';
import env from '@/main/config/env';

export const makeUpdateUser = (): UpdateUser => {
  const bcryptAdapter = new BcryptAdapter(env.passwordHashSalt);
  const prismaUserRepository = new PrismaUserRepository(prisma);
  return new DbUpdateUser(prismaUserRepository, bcryptAdapter);
};
