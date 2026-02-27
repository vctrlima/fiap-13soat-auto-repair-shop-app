import { DbGetUserById } from '@/application/use-cases/user/db-get-user-by-id';
import { GetUserById } from '@/domain/use-cases';
import { prisma, PrismaUserRepository } from '@/infra/db';

export const makeGetUserById = (): GetUserById => {
  const prismaUserRepository = new PrismaUserRepository(prisma);
  return new DbGetUserById(prismaUserRepository);
};
