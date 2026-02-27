import { GetServiceById } from '@/domain/use-cases';

export interface GetServiceByIdRepository {
  getById: (params: GetServiceByIdRepository.Params) => Promise<GetServiceByIdRepository.Result>;
}

export namespace GetServiceByIdRepository {
  export type Params = GetServiceById.Params;
  export type Result = GetServiceById.Result;
}
