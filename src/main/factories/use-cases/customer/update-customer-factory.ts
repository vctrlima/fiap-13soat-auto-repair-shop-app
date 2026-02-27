import { DbUpdateCustomer } from '@/application/use-cases';
import { UpdateCustomer } from '@/domain/use-cases';
import { PrismaCustomerRepository, prisma } from '@/infra/db';

export const makeUpdateCustomer = (): UpdateCustomer => {
  const prismaCustomerRepository = new PrismaCustomerRepository(prisma);
  return new DbUpdateCustomer(prismaCustomerRepository);
};
