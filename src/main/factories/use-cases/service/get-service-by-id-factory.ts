import { DbGetServiceById } from '@/application/use-cases';
import { GetServiceById } from '@/domain/use-cases';
import { PrismaServiceRepository, prisma } from '@/infra/db';

export const makeGetServiceById = (): GetServiceById => {
  const prismaServiceRepository = new PrismaServiceRepository(prisma);
  return new DbGetServiceById(prismaServiceRepository);
};
