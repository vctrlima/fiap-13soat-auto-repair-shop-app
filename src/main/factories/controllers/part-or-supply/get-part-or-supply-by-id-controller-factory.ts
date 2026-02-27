import { makeGetPartOrSupplyById } from '@/main/factories/use-cases';
import { GetPartOrSupplyByIdController } from '@/presentation/controllers';

export const makeGetPartOrSupplyByIdController = (): GetPartOrSupplyByIdController =>
  new GetPartOrSupplyByIdController(makeGetPartOrSupplyById());
