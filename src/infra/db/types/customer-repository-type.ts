import { VehicleRepositoryType } from './vehicle-repository-type';

export interface CustomerRepositoryType {
  id: string;
  document: string;
  name: string;
  email: string;
  phone: string | null;
  vehicles?: Omit<VehicleRepositoryType, 'customer'>[];
  createdAt: Date;
  updatedAt: Date | null;
}
