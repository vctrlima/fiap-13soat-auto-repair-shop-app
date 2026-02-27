import { DeleteWorkOrder } from '@/domain/use-cases';

export interface DeleteWorkOrderRepository {
  delete: (params: DeleteWorkOrderRepository.Params) => Promise<DeleteWorkOrderRepository.Result>;
}

export namespace DeleteWorkOrderRepository {
  export type Params = DeleteWorkOrder.Params;
  export type Result = DeleteWorkOrder.Result;
}
