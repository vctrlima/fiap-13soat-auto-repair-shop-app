import { UpdateVehicleRepository } from '@/application/protocols/db';
import { UpdateVehicle } from '@/domain/use-cases';

export class DbUpdateVehicle implements UpdateVehicle {
  constructor(private readonly updateVehicleRepository: UpdateVehicleRepository) {}

  async update(params: UpdateVehicle.Params): Promise<UpdateVehicle.Result> {
    return await this.updateVehicleRepository.update(params);
  }
}
