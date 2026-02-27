import { CreateCustomer } from '@/domain/use-cases';

export interface CreateCustomerRepository {
  create: (params: CreateCustomerRepository.Params) => Promise<CreateCustomerRepository.Result>;
}

export namespace CreateCustomerRepository {
  export type Params = CreateCustomer.Params;
  export type Result = CreateCustomer.Result;
}
