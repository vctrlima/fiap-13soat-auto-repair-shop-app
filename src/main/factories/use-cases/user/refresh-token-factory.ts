import { DbRefreshToken } from '@/application/use-cases';
import { RefreshToken } from '@/domain/use-cases';
import { JwtAdapter } from '@/infra/cryptography';
import { PrismaRefreshTokenRepository, PrismaUserRepository, prisma } from '@/infra/db';

export const makeRefreshToken = (): RefreshToken => {
  const jwtAdapter = new JwtAdapter();
  const prismaRefreshTokenRepository = new PrismaRefreshTokenRepository(prisma);
  const prismaUserRepository = new PrismaUserRepository(prisma);
  return new DbRefreshToken(
    prismaRefreshTokenRepository,
    prismaRefreshTokenRepository,
    prismaRefreshTokenRepository,
    prismaUserRepository,
    jwtAdapter,
    jwtAdapter
  );
};
