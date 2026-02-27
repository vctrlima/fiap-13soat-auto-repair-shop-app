import { DbCreateVehicle } from '@/application/use-cases';
import { CreateVehicle } from '@/domain/use-cases';
import { PrismaVehicleRepository, prisma } from '@/infra/db';

export const makeCreateVehicle = (): CreateVehicle => {
  const prismaVehicleRepository = new PrismaVehicleRepository(prisma);
  return new DbCreateVehicle(prismaVehicleRepository);
};
