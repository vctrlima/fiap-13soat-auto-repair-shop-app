import { DbCreateCustomer } from '@/application/use-cases';
import { CreateCustomer } from '@/domain/use-cases';
import { PrismaCustomerRepository, prisma } from '@/infra/db';

export const makeCreateCustomer = (): CreateCustomer => {
  const prismaCustomerRepository = new PrismaCustomerRepository(prisma);
  return new DbCreateCustomer(prismaCustomerRepository);
};
