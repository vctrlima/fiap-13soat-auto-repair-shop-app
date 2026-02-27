import { DeleteVehicleRepository } from '@/application/protocols/db';
import { DeleteVehicle } from '@/domain/use-cases';

export class DbDeleteVehicle implements DeleteVehicle {
  constructor(private readonly deleteVehicleRepository: DeleteVehicleRepository) {}

  async delete(params: DeleteVehicle.Params): Promise<DeleteVehicle.Result> {
    return await this.deleteVehicleRepository.delete(params);
  }
}
