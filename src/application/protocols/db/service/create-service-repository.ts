import { CreateService } from '@/domain/use-cases';

export interface CreateServiceRepository {
  create: (params: CreateServiceRepository.Params) => Promise<CreateServiceRepository.Result>;
}

export namespace CreateServiceRepository {
  export type Params = CreateService.Params;
  export type Result = CreateService.Result;
}
