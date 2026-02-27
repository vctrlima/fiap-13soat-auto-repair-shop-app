import { Vehicle } from '@/domain/entities';
import { DefaultPageParams, Page } from '@/domain/types';

export interface GetAllVehicles {
  getAll: (params: GetAllVehicles.Params) => Promise<GetAllVehicles.Result>;
}

export namespace GetAllVehicles {
  export type Params = DefaultPageParams & {
    customerId?: string;
    licensePlate?: string;
    brand?: string;
    model?: string;
    year?: number;
  };

  export type Result = Page<Vehicle>;
}
