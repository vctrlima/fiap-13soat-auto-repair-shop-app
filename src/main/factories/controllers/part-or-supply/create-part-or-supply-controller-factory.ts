import { makeCreatePartOrSupply } from '@/main/factories/use-cases';
import { CreatePartOrSupplyController } from '@/presentation/controllers';

export const makeCreatePartOrSupplyController = (): CreatePartOrSupplyController =>
  new CreatePartOrSupplyController(makeCreatePartOrSupply());
