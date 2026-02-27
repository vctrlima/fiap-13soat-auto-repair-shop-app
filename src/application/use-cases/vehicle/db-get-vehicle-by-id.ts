import { GetVehicleByIdRepository } from '@/application/protocols/db';
import { GetVehicleById } from '@/domain/use-cases';

export class DbGetVehicleById implements GetVehicleById {
  constructor(private readonly getVehicleByIdRepository: GetVehicleByIdRepository) {}

  async getById(params: GetVehicleById.Params): Promise<GetVehicleById.Result> {
    return await this.getVehicleByIdRepository.getById(params);
  }
}
