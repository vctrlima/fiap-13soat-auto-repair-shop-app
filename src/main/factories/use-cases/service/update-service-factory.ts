import { DbUpdateService } from '@/application/use-cases';
import { UpdateService } from '@/domain/use-cases';
import { PrismaServiceRepository, prisma } from '@/infra/db';

export const makeUpdateService = (): UpdateService => {
  const prismaServiceRepository = new PrismaServiceRepository(prisma);
  return new DbUpdateService(prismaServiceRepository);
};
