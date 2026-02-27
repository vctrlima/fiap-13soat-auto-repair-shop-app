import { DbGetAllServices } from '@/application/use-cases';
import { GetAllServices } from '@/domain/use-cases';
import { PrismaServiceRepository, prisma } from '@/infra/db';

export const makeGetAllServices = (): GetAllServices => {
  const prismaServiceRepository = new PrismaServiceRepository(prisma);
  return new DbGetAllServices(prismaServiceRepository);
};
