import { Vehicle } from '@/domain/entities';

export interface CreateVehicle {
  create: (data: CreateVehicle.Params) => Promise<CreateVehicle.Result>;
}

export namespace CreateVehicle {
  export type Params = {
    customerId: string;
    licensePlate: string;
    brand: string;
    model: string;
    year: number;
  };

  export type Result = Vehicle;
}
