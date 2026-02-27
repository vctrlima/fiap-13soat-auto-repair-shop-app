import { makeDeleteVehicle } from '@/main/factories/use-cases';
import { DeleteVehicleController } from '@/presentation/controllers';

export const makeDeleteVehicleController = (): DeleteVehicleController =>
  new DeleteVehicleController(makeDeleteVehicle());
