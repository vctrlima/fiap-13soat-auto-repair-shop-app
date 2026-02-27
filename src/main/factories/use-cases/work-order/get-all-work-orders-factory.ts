import { DbGetAllWorkOrders } from '@/application/use-cases';
import { GetAllWorkOrders } from '@/domain/use-cases';
import { PrismaWorkOrderRepository, prisma } from '@/infra/db';

export const makeGetAllWorkOrders = (): GetAllWorkOrders => {
  const prismaWorkOrderRepository = new PrismaWorkOrderRepository(prisma);
  return new DbGetAllWorkOrders(prismaWorkOrderRepository);
};
