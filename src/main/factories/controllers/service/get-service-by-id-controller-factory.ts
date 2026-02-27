import { makeGetServiceById } from '@/main/factories/use-cases';
import { GetServiceByIdController } from '@/presentation/controllers';

export const makeGetServiceByIdController = (): GetServiceByIdController =>
  new GetServiceByIdController(makeGetServiceById());
