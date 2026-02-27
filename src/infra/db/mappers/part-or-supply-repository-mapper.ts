import { PartOrSupply } from '@/domain/entities';
import { PartOrSupplyRepositoryType } from '@/infra/db/types';

export class PartOrSupplyRepositoryMapper {
  public static dataToEntity(data: PartOrSupplyRepositoryType): PartOrSupply {
    return {
      id: data.id,
      name: data.name as string,
      description: data.description,
      price: data.price,
      inStock: data.inStock ?? 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt || null,
    };
  }
}
