import { GetAllCustomers } from '@/domain/use-cases';

export interface GetAllCustomersRepository {
  getAll: (params: GetAllCustomersRepository.Params) => Promise<GetAllCustomersRepository.Result>;
}

export namespace GetAllCustomersRepository {
  export type Params = GetAllCustomers.Params;
  export type Result = GetAllCustomers.Result;
}
