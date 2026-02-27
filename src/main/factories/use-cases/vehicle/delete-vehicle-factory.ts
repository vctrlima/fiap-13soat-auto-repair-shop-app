import { DbDeleteVehicle } from '@/application/use-cases';
import { DeleteVehicle } from '@/domain/use-cases';
import { PrismaVehicleRepository, prisma } from '@/infra/db';

export const makeDeleteVehicle = (): DeleteVehicle => {
  const prismaVehicleRepository = new PrismaVehicleRepository(prisma);
  return new DbDeleteVehicle(prismaVehicleRepository);
};
