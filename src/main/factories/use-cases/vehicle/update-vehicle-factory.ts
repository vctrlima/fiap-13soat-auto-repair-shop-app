import { DbUpdateVehicle } from '@/application/use-cases';
import { UpdateVehicle } from '@/domain/use-cases';
import { PrismaVehicleRepository, prisma } from '@/infra/db';

export const makeUpdateVehicle = (): UpdateVehicle => {
  const prismaVehicleRepository = new PrismaVehicleRepository(prisma);
  return new DbUpdateVehicle(prismaVehicleRepository);
};
