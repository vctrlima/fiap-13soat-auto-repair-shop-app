import { Vehicle } from '@/domain/entities';
import { CustomerRepositoryType, VehicleRepositoryType } from '@/infra/db/types';
import { CustomerRepositoryMapper } from './customer-repository-mapper';

export class VehicleRepositoryMapper {
  public static dataToEntity(data: VehicleRepositoryType): Vehicle {
    const vehicle: Vehicle = {
      id: data.id,
      licensePlate: data.licensePlate,
      brand: data.brand,
      model: data.model,
      year: data.year,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
    if (data.customer) {
      Object.assign(vehicle, {
        customer: CustomerRepositoryMapper.dataToEntity(data.customer as CustomerRepositoryType),
      });
    }
    return vehicle;
  }
}
