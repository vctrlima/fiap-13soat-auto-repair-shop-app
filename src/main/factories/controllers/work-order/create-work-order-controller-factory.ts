import { makeCreateWorkOrder } from '@/main/factories/use-cases';
import { CreateWorkOrderController } from '@/presentation/controllers';

export const makeCreateWorkOrderController = (): CreateWorkOrderController =>
  new CreateWorkOrderController(makeCreateWorkOrder());
