import { DeleteService } from '@/domain/use-cases';

export interface DeleteServiceRepository {
  delete: (params: DeleteServiceRepository.Params) => Promise<DeleteServiceRepository.Result>;
}

export namespace DeleteServiceRepository {
  export type Params = DeleteService.Params;
  export type Result = DeleteService.Result;
}
