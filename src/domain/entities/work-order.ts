import { Status } from '@/domain/enums';
import { Customer } from './customer';
import { PartOrSupply } from './part-or-supply';
import { Service } from './service';
import { Vehicle } from './vehicle';

export interface WorkOrder {
  id: string;
  customer: Customer;
  vehicle: Vehicle;
  services: Service[];
  partsAndSupplies: PartOrSupply[];
  status: Status;
  budget: number;
  createdAt: Date;
  updatedAt?: Date | null;
}
