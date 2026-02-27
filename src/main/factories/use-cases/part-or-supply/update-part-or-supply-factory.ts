import { DbUpdatePartOrSupply } from '@/application/use-cases';
import { UpdatePartOrSupply } from '@/domain/use-cases';
import { PrismaPartOrSupplyRepository, prisma } from '@/infra/db';

export const makeUpdatePartOrSupply = (): UpdatePartOrSupply => {
  const prismaPartOrSupplyRepository = new PrismaPartOrSupplyRepository(prisma);
  return new DbUpdatePartOrSupply(prismaPartOrSupplyRepository);
};
