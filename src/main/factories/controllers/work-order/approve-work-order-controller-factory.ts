import { makeApproveWorkOrder } from '@/main/factories/use-cases';
import { ApproveWorkOrderController } from '@/presentation/controllers';

export const makeApproveWorkOrderController = (): ApproveWorkOrderController =>
  new ApproveWorkOrderController(makeApproveWorkOrder());
