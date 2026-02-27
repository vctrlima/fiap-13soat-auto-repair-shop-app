import { GetAllVehicles } from '@/domain/use-cases';

export interface GetAllVehiclesRepository {
  getAll: (params: GetAllVehiclesRepository.Params) => Promise<GetAllVehiclesRepository.Result>;
}

export namespace GetAllVehiclesRepository {
  export type Params = GetAllVehicles.Params;
  export type Result = GetAllVehicles.Result;
}
