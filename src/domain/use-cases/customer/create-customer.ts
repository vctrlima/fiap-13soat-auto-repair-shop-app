import { Customer } from '@/domain/entities';

export interface CreateCustomer {
  create: (data: CreateCustomer.Params) => Promise<CreateCustomer.Result>;
}

export namespace CreateCustomer {
  export type Params = {
    document: string;
    name: string;
    email: string;
    phone?: string;
  };

  export type Result = Customer;
}
