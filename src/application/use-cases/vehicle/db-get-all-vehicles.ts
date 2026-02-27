import { GetAllVehiclesRepository } from '@/application/protocols/db';
import { GetAllVehicles } from '@/domain/use-cases';

export class DbGetAllVehicles implements GetAllVehicles {
  constructor(private readonly getAllVehiclesRepository: GetAllVehiclesRepository) {}

  async getAll(params: GetAllVehicles.Params): Promise<GetAllVehicles.Result> {
    return await this.getAllVehiclesRepository.getAll(params);
  }
}
