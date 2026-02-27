import { makeCreateService } from '@/main/factories/use-cases';
import { CreateServiceController } from '@/presentation/controllers';

export const makeCreateServiceController = (): CreateServiceController =>
  new CreateServiceController(makeCreateService());
