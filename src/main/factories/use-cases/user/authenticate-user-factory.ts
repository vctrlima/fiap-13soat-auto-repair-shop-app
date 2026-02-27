import { DbAuthenticateUser } from '@/application/use-cases';
import { AuthenticateUser } from '@/domain/use-cases';
import { BcryptAdapter, JwtAdapter } from '@/infra/cryptography';
import { PrismaRefreshTokenRepository, PrismaUserRepository, prisma } from '@/infra/db';
import env from '@/main/config/env';

export const makeAuthenticateUser = (): AuthenticateUser => {
  const bcryptAdapter = new BcryptAdapter(env.passwordHashSalt);
  const jwtAdapter = new JwtAdapter();
  const prismaUserRepository = new PrismaUserRepository(prisma);
  const prismaRefreshTokenRepository = new PrismaRefreshTokenRepository(prisma);
  return new DbAuthenticateUser(prismaUserRepository, bcryptAdapter, jwtAdapter, prismaRefreshTokenRepository);
};
