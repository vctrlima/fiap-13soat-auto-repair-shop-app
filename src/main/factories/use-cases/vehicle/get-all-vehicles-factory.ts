import { DbGetAllVehicles } from '@/application/use-cases';
import { GetAllVehicles } from '@/domain/use-cases';
import { PrismaVehicleRepository, prisma } from '@/infra/db';

export const makeGetAllVehicles = (): GetAllVehicles => {
  const prismaVehicleRepository = new PrismaVehicleRepository(prisma);
  return new DbGetAllVehicles(prismaVehicleRepository);
};
