import { DbDeletePartOrSupply } from '@/application/use-cases';
import { DeletePartOrSupply } from '@/domain/use-cases';
import { PrismaPartOrSupplyRepository, prisma } from '@/infra/db';

export const makeDeletePartOrSupply = (): DeletePartOrSupply => {
  const prismaPartOrSupplyRepository = new PrismaPartOrSupplyRepository(prisma);
  return new DbDeletePartOrSupply(prismaPartOrSupplyRepository);
};
