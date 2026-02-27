import { DeletePartOrSupply } from '@/domain/use-cases';

export interface DeletePartOrSupplyRepository {
  delete: (params: DeletePartOrSupplyRepository.Params) => Promise<DeletePartOrSupplyRepository.Result>;
}

export namespace DeletePartOrSupplyRepository {
  export type Params = DeletePartOrSupply.Params;
  export type Result = DeletePartOrSupply.Result;
}
