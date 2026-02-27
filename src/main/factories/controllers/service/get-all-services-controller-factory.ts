import { makeGetAllServices } from '@/main/factories/use-cases';
import { GetAllServicesController } from '@/presentation/controllers';

export const makeGetAllServicesController = (): GetAllServicesController =>
  new GetAllServicesController(makeGetAllServices());
