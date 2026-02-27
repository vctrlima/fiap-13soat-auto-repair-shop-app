import { DeleteVehicle } from '@/domain/use-cases';

export interface DeleteVehicleRepository {
  delete: (params: DeleteVehicleRepository.Params) => Promise<DeleteVehicleRepository.Result>;
}

export namespace DeleteVehicleRepository {
  export type Params = DeleteVehicle.Params;
  export type Result = DeleteVehicle.Result;
}
