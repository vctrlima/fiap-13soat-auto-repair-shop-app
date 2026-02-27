import { DbGetUserByToken } from '@/application/use-cases';
import { GetUserByToken } from '@/domain/use-cases';
import { JwtAdapter } from '@/infra/cryptography';
import { PrismaUserRepository, prisma } from '@/infra/db';

export const makeGetUserByToken = (): GetUserByToken => {
  const jwtAdapter = new JwtAdapter();
  const prismaUserRepository = new PrismaUserRepository(prisma);
  return new DbGetUserByToken(jwtAdapter, prismaUserRepository);
};
