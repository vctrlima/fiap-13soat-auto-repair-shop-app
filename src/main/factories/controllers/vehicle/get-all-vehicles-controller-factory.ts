import { makeGetAllVehicles } from '@/main/factories/use-cases';
import { GetAllVehiclesController } from '@/presentation/controllers';

export const makeGetAllVehiclesController = (): GetAllVehiclesController =>
  new GetAllVehiclesController(makeGetAllVehicles());
