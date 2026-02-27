import { DbGetCustomerByDocument } from '@/application/use-cases';
import { GetCustomerByDocument } from '@/domain/use-cases';
import { PrismaCustomerRepository, prisma } from '@/infra/db';

export const makeGetCustomerByDocument = (): GetCustomerByDocument => {
  const prismaCustomerRepository = new PrismaCustomerRepository(prisma);
  return new DbGetCustomerByDocument(prismaCustomerRepository);
};
