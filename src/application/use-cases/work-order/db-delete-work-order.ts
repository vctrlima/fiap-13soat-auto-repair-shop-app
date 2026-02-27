import { DeleteWorkOrderRepository } from '@/application/protocols/db';
import { DeleteWorkOrder } from '@/domain/use-cases';

export class DbDeleteWorkOrder implements DeleteWorkOrder {
  constructor(private readonly deleteWorkOrderRepository: DeleteWorkOrderRepository) {}

  async delete(params: DeleteWorkOrder.Params): Promise<DeleteWorkOrder.Result> {
    return await this.deleteWorkOrderRepository.delete(params);
  }
}
