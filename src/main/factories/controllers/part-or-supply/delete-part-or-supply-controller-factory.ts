import { makeDeletePartOrSupply } from '@/main/factories/use-cases';
import { DeletePartOrSupplyController } from '@/presentation/controllers';

export const makeDeletePartOrSupplyController = (): DeletePartOrSupplyController =>
  new DeletePartOrSupplyController(makeDeletePartOrSupply());
