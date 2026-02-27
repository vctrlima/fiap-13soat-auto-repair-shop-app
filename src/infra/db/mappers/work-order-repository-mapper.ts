import { WorkOrder } from '@/domain/entities';
import { Status } from '@/domain/enums';
import { WorkOrderRepositoryType } from '@/infra/db/types';
import { CustomerRepositoryMapper } from './customer-repository-mapper';
import { PartOrSupplyRepositoryMapper } from './part-or-supply-repository-mapper';
import { ServiceRepositoryMapper } from './service-repository-mapper';
import { VehicleRepositoryMapper } from './vehicle-repository-mapper';

export class WorkOrderRepositoryMapper {
  public static dataToEntity(data: WorkOrderRepositoryType): WorkOrder {
    return {
      id: data.id,
      customer: CustomerRepositoryMapper.dataToEntity(data.customer),
      vehicle: VehicleRepositoryMapper.dataToEntity(data.vehicle),
      services: (data.services || []).map((service: any) => ServiceRepositoryMapper.dataToEntity(service)),
      partsAndSupplies: (data.parts || []).map((part: any) => PartOrSupplyRepositoryMapper.dataToEntity(part)),
      status: data.status as Status,
      budget: data.budget,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
