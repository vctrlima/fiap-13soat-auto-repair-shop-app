import { DbGetAllCustomers } from '@/application/use-cases';
import { GetAllCustomers } from '@/domain/use-cases';
import { PrismaCustomerRepository, prisma } from '@/infra/db';

export const makeGetAllCustomers = (): GetAllCustomers => {
  const prismaCustomerRepository = new PrismaCustomerRepository(prisma);
  return new DbGetAllCustomers(prismaCustomerRepository);
};
