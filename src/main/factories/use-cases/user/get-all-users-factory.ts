import { DbGetAllUsers } from '@/application/use-cases';
import { GetAllUsers } from '@/domain/use-cases';
import { prisma } from '@/infra/db';
import { PrismaUserRepository } from '@/infra/db/repositories/prisma-user-repository';

export const makeGetAllUsers = (): GetAllUsers => {
  const prismaUserRepository = new PrismaUserRepository(prisma);
  return new DbGetAllUsers(prismaUserRepository);
};
