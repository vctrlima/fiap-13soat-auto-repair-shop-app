import { makeUpdateService } from '@/main/factories/use-cases';
import { UpdateServiceController } from '@/presentation/controllers';

export const makeUpdateServiceController = (): UpdateServiceController =>
  new UpdateServiceController(makeUpdateService());
