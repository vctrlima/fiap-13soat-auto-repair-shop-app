import { DbCreateService } from '@/application/use-cases';
import { CreateService } from '@/domain/use-cases';
import { PrismaServiceRepository, prisma } from '@/infra/db';

export const makeCreateService = (): CreateService => {
  const prismaServiceRepository = new PrismaServiceRepository(prisma);
  return new DbCreateService(prismaServiceRepository);
};
