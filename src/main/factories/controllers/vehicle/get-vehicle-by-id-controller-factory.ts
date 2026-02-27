import { makeGetVehicleById } from '@/main/factories/use-cases';
import { GetVehicleByIdController } from '@/presentation/controllers';

export const makeGetVehicleByIdController = (): GetVehicleByIdController =>
  new GetVehicleByIdController(makeGetVehicleById());
