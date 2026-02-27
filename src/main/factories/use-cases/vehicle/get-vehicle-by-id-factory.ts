import { DbGetVehicleById } from '@/application/use-cases';
import { GetVehicleById } from '@/domain/use-cases';
import { PrismaVehicleRepository, prisma } from '@/infra/db';

export const makeGetVehicleById = (): GetVehicleById => {
  const prismaVehicleRepository = new PrismaVehicleRepository(prisma);
  return new DbGetVehicleById(prismaVehicleRepository);
};
