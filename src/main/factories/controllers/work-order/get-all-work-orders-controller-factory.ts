import { makeGetAllWorkOrders } from '@/main/factories/use-cases';
import { GetAllWorkOrdersController } from '@/presentation/controllers';

export const makeGetAllWorkOrdersController = (): GetAllWorkOrdersController =>
  new GetAllWorkOrdersController(makeGetAllWorkOrders());
