import { makeCancelWorkOrder } from '@/main/factories/use-cases';
import { CancelWorkOrderController } from '@/presentation/controllers';

export const makeCancelWorkOrderController = (): CancelWorkOrderController =>
  new CancelWorkOrderController(makeCancelWorkOrder());
