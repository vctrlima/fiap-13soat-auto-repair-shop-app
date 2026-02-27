import { UpdateVehicle } from '@/domain/use-cases';

export interface UpdateVehicleRepository {
  update: (params: UpdateVehicleRepository.Params) => Promise<UpdateVehicleRepository.Result>;
}

export namespace UpdateVehicleRepository {
  export type Params = UpdateVehicle.Params;
  export type Result = UpdateVehicle.Result;
}
