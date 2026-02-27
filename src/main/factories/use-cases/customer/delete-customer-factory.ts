import { DbDeleteCustomer } from '@/application/use-cases';
import { DeleteCustomer } from '@/domain/use-cases';
import { PrismaCustomerRepository, prisma } from '@/infra/db';

export const makeDeleteCustomer = (): DeleteCustomer => {
  const prismaCustomerRepository = new PrismaCustomerRepository(prisma);
  return new DbDeleteCustomer(prismaCustomerRepository);
};
