import { DeleteCustomer } from '@/domain/use-cases';

export interface DeleteCustomerRepository {
  delete: (params: DeleteCustomerRepository.Params) => Promise<DeleteCustomerRepository.Result>;
}

export namespace DeleteCustomerRepository {
  export type Params = DeleteCustomer.Params;
  export type Result = DeleteCustomer.Result;
}
