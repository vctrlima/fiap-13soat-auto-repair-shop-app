import { makeGetAllPartsOrSupplies } from '@/main/factories/use-cases';
import { GetAllPartsOrSuppliesController } from '@/presentation/controllers';

export const makeGetAllPartsOrSuppliesController = (): GetAllPartsOrSuppliesController =>
  new GetAllPartsOrSuppliesController(makeGetAllPartsOrSupplies());
