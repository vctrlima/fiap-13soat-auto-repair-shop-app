import { GetVehicleById } from '@/domain/use-cases';

export interface GetVehicleByIdRepository {
  getById: (params: GetVehicleByIdRepository.Params) => Promise<GetVehicleByIdRepository.Result>;
}

export namespace GetVehicleByIdRepository {
  export type Params = GetVehicleById.Params;
  export type Result = GetVehicleById.Result;
}
