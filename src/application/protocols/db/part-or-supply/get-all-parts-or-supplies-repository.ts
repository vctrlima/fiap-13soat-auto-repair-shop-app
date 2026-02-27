import { GetAllPartsOrSupplies } from '@/domain/use-cases';

export interface GetAllPartsOrSuppliesRepository {
  getAll: (params: GetAllPartsOrSuppliesRepository.Params) => Promise<GetAllPartsOrSuppliesRepository.Result>;
}

export namespace GetAllPartsOrSuppliesRepository {
  export type Params = GetAllPartsOrSupplies.Params;
  export type Result = GetAllPartsOrSupplies.Result;
}
