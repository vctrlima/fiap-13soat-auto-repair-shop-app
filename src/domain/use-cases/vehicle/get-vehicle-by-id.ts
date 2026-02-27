import { Vehicle } from '@/domain/entities';

export interface GetVehicleById {
  getById: (params: GetVehicleById.Params) => Promise<GetVehicleById.Result>;
}

export namespace GetVehicleById {
  export type Params = { id: string };
  export type Result = Vehicle;
}
