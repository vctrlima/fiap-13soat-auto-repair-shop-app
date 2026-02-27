import { makeDeleteWorkOrder } from '@/main/factories/use-cases';
import { DeleteWorkOrderController } from '@/presentation/controllers';

export const makeDeleteWorkOrderController = (): DeleteWorkOrderController =>
  new DeleteWorkOrderController(makeDeleteWorkOrder());
