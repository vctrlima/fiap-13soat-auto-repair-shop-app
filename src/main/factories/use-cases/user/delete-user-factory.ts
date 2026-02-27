import { DbDeleteUser } from '@/application/use-cases';
import { DeleteUser } from '@/domain/use-cases';
import { prisma, PrismaUserRepository } from '@/infra/db';

export const makeDeleteUser = (): DeleteUser => {
  const prismaUserRepository = new PrismaUserRepository(prisma);
  return new DbDeleteUser(prismaUserRepository);
};
