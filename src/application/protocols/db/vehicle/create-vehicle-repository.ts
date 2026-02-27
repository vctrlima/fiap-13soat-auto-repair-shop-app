import { CreateVehicle } from '@/domain/use-cases';

export interface CreateVehicleRepository {
  create: (params: CreateVehicleRepository.Params) => Promise<CreateVehicleRepository.Result>;
}

export namespace CreateVehicleRepository {
  export type Params = CreateVehicle.Params;
  export type Result = CreateVehicle.Result;
}
