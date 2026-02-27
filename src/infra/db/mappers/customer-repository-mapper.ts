import { Customer } from '@/domain/entities';
import { CustomerRepositoryType, VehicleRepositoryType } from '@/infra/db/types';
import { VehicleRepositoryMapper } from './vehicle-repository-mapper';

export class CustomerRepositoryMapper {
  public static dataToEntity(data: CustomerRepositoryType): Customer {
    return {
      id: data.id,
      document: data.document,
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      vehicles:
        data && data.vehicles
          ? data.vehicles.map((vehicle) =>
              VehicleRepositoryMapper.dataToEntity(vehicle as VehicleRepositoryType)
            )
          : [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
