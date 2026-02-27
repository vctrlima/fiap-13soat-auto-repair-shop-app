import { DbGetAllPartsOrSupplies } from '@/application/use-cases';
import { GetAllPartsOrSupplies } from '@/domain/use-cases';
import { PrismaPartOrSupplyRepository, prisma } from '@/infra/db';

export const makeGetAllPartsOrSupplies = (): GetAllPartsOrSupplies => {
  const prismaPartOrSupplyRepository = new PrismaPartOrSupplyRepository(prisma);
  return new DbGetAllPartsOrSupplies(prismaPartOrSupplyRepository);
};
