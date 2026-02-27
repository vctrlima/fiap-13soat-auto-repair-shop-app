import { makeUpdateWorkOrder } from '@/main/factories/use-cases';
import { UpdateWorkOrderController } from '@/presentation/controllers';

export const makeUpdateWorkOrderController = (): UpdateWorkOrderController =>
  new UpdateWorkOrderController(makeUpdateWorkOrder());
