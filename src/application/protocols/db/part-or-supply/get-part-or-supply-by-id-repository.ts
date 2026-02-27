import { GetPartOrSupplyById } from '@/domain/use-cases';

export interface GetPartOrSupplyByIdRepository {
  getById: (params: GetPartOrSupplyByIdRepository.Params) => Promise<GetPartOrSupplyByIdRepository.Result>;
}

export namespace GetPartOrSupplyByIdRepository {
  export type Params = GetPartOrSupplyById.Params;
  export type Result = GetPartOrSupplyById.Result;
}
