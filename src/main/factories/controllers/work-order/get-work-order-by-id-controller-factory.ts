import { makeGetWorkOrderById } from '@/main/factories/use-cases';
import { GetWorkOrderByIdController } from '@/presentation/controllers';

export const makeGetWorkOrderByIdController = (): GetWorkOrderByIdController =>
  new GetWorkOrderByIdController(makeGetWorkOrderById());
