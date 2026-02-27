import { Service } from '@/domain/entities';
import { ServiceRepositoryType } from '@/infra/db/types';

export class ServiceRepositoryMapper {
  public static dataToEntity(data: ServiceRepositoryType): Service {
    return {
      id: data.id,
      name: data.name as string,
      description: data.description,
      price: data.price,
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt,
    };
  }
}
