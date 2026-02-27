import { DbDeleteService } from '@/application/use-cases';
import { DeleteService } from '@/domain/use-cases';
import { PrismaServiceRepository, prisma } from '@/infra/db';

export const makeDeleteService = (): DeleteService => {
  const prismaServiceRepository = new PrismaServiceRepository(prisma);
  return new DbDeleteService(prismaServiceRepository);
};
