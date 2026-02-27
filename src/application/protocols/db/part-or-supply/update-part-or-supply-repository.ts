import { UpdatePartOrSupply } from '@/domain/use-cases';

export interface UpdatePartOrSupplyRepository {
  update: (params: UpdatePartOrSupplyRepository.Params) => Promise<UpdatePartOrSupplyRepository.Result>;
}

export namespace UpdatePartOrSupplyRepository {
  export type Params = UpdatePartOrSupply.Params;
  export type Result = UpdatePartOrSupply.Result;
}
