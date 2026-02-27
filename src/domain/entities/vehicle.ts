import { Customer } from './customer';

export interface Vehicle {
  id: string;
  customer?: Customer;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  createdAt: Date;
  updatedAt?: Date | null;
}
