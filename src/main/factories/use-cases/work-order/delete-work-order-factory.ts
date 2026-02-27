import { DbDeleteWorkOrder } from '@/application/use-cases';
import { DeleteWorkOrder } from '@/domain/use-cases';
import { PrismaWorkOrderRepository, prisma } from '@/infra/db';

export const makeDeleteWorkOrder = (): DeleteWorkOrder => {
  const prismaWorkOrderRepository = new PrismaWorkOrderRepository(prisma);
  return new DbDeleteWorkOrder(prismaWorkOrderRepository);
};
