import { DbGetPartOrSupplyById } from '@/application/use-cases';
import { GetPartOrSupplyById } from '@/domain/use-cases';
import { PrismaPartOrSupplyRepository, prisma } from '@/infra/db';

export const makeGetPartOrSupplyById = (): GetPartOrSupplyById => {
  const prismaPartOrSupplyRepository = new PrismaPartOrSupplyRepository(prisma);
  return new DbGetPartOrSupplyById(prismaPartOrSupplyRepository);
};
