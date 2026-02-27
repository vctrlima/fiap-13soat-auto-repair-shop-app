import { Vehicle } from '@/domain/entities';

export interface UpdateVehicle {
  update: (data: UpdateVehicle.Params) => Promise<UpdateVehicle.Result>;
}

export namespace UpdateVehicle {
  export type Params = {
    id: string;
    licensePlate?: string;
    brand?: string;
    model?: string;
    year?: number;
    customerId?: string;
  };

  export type Result = Vehicle;
}
