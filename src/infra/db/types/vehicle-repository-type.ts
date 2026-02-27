import { CustomerRepositoryType } from './customer-repository-type';

export interface VehicleRepositoryType {
  id: string;
  customerId: string;
  customer: Omit<CustomerRepositoryType, 'vehicles'>;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  createdAt: Date;
  updatedAt: Date | null;
}
