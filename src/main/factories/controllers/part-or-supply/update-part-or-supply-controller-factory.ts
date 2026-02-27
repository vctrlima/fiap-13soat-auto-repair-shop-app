import { makeUpdatePartOrSupply } from '@/main/factories/use-cases';
import { UpdatePartOrSupplyController } from '@/presentation/controllers';

export const makeUpdatePartOrSupplyController = (): UpdatePartOrSupplyController =>
  new UpdatePartOrSupplyController(makeUpdatePartOrSupply());
