import { Status } from '@/domain/enums';
import { CustomerRepositoryType } from './customer-repository-type';
import { PartOrSupplyRepositoryType } from './part-or-supply-repository-type';
import { ServiceRepositoryType } from './service-repository-type';
import { VehicleRepositoryType } from './vehicle-repository-type';

export interface WorkOrderRepositoryType {
  id: string;
  customerId: string;
  customer: CustomerRepositoryType;
  vehicleId: string;
  vehicle: VehicleRepositoryType;
  services: ServiceRepositoryType[];
  parts: PartOrSupplyRepositoryType[];
  status: Status | string;
  budget: number;
  createdAt: Date;
  updatedAt: Date | null;
}
