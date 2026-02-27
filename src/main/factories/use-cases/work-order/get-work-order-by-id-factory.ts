import { DbGetWorkOrderById } from '@/application/use-cases';
import { GetWorkOrderById } from '@/domain/use-cases';
import { PrismaWorkOrderRepository, prisma } from '@/infra/db';

export const makeGetWorkOrderById = (): GetWorkOrderById => {
  const prismaWorkOrderRepository = new PrismaWorkOrderRepository(prisma);
  return new DbGetWorkOrderById(prismaWorkOrderRepository);
};
