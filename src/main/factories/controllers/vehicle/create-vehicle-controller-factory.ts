import { makeCreateVehicle } from '@/main/factories/use-cases';
import { makeLicensePlateValidator } from '@/main/factories/validators';
import { CreateVehicleController } from '@/presentation/controllers';

export const makeCreateVehicleController = (): CreateVehicleController =>
  new CreateVehicleController(makeCreateVehicle(), makeLicensePlateValidator());
