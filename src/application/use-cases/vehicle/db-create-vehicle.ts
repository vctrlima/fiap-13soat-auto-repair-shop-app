import { CreateVehicleRepository } from '@/application/protocols/db';
import { CreateVehicle } from '@/domain/use-cases';

export class DbCreateVehicle implements CreateVehicle {
  constructor(private readonly createVehicleRepository: CreateVehicleRepository) {}

  async create(params: CreateVehicle.Params): Promise<CreateVehicle.Result> {
    return await this.createVehicleRepository.create(params);
  }
}
