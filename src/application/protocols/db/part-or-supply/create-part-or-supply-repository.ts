import { CreatePartOrSupply } from '@/domain/use-cases';

export interface CreatePartOrSupplyRepository {
  create: (params: CreatePartOrSupplyRepository.Params) => Promise<CreatePartOrSupplyRepository.Result>;
}

export namespace CreatePartOrSupplyRepository {
  export type Params = CreatePartOrSupply.Params;
  export type Result = CreatePartOrSupply.Result;
}
