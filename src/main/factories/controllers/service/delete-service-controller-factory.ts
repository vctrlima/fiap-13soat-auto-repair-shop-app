import { makeDeleteService } from '@/main/factories/use-cases';
import { DeleteServiceController } from '@/presentation/controllers';

export const makeDeleteServiceController = (): DeleteServiceController =>
  new DeleteServiceController(makeDeleteService());
