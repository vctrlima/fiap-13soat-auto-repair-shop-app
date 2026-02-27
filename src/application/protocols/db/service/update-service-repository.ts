import { UpdateService } from '@/domain/use-cases';

export interface UpdateServiceRepository {
  update: (params: UpdateServiceRepository.Params) => Promise<UpdateServiceRepository.Result>;
}

export namespace UpdateServiceRepository {
  export type Params = UpdateService.Params;
  export type Result = UpdateService.Result;
}
