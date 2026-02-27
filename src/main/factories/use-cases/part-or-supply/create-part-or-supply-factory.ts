import { DbCreatePartOrSupply } from '@/application/use-cases';
import { CreatePartOrSupply } from '@/domain/use-cases';
import { PrismaPartOrSupplyRepository, prisma } from '@/infra/db';

export const makeCreatePartOrSupply = (): CreatePartOrSupply => {
  const prismaPartOrSupplyRepository = new PrismaPartOrSupplyRepository(prisma);
  return new DbCreatePartOrSupply(prismaPartOrSupplyRepository);
};
