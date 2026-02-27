import { makeUpdateVehicle } from '@/main/factories/use-cases';
import { makeLicensePlateValidator } from '@/main/factories/validators';
import { UpdateVehicleController } from '@/presentation/controllers';

export const makeUpdateVehicleController = (): UpdateVehicleController =>
  new UpdateVehicleController(makeUpdateVehicle(), makeLicensePlateValidator());
