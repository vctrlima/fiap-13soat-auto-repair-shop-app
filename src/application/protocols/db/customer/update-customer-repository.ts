import { UpdateCustomer } from '@/domain/use-cases';

export interface UpdateCustomerRepository {
  update: (params: UpdateCustomerRepository.Params) => Promise<UpdateCustomerRepository.Result>;
}

export namespace UpdateCustomerRepository {
  export type Params = UpdateCustomer.Params;
  export type Result = UpdateCustomer.Result;
}
