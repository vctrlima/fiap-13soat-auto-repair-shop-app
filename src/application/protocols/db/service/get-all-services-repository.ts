import { GetAllServices } from '@/domain/use-cases';

export interface GetAllServicesRepository {
  getAll: (params: GetAllServicesRepository.Params) => Promise<GetAllServicesRepository.Result>;
}

export namespace GetAllServicesRepository {
  export type Params = GetAllServices.Params;
  export type Result = GetAllServices.Result;
}
