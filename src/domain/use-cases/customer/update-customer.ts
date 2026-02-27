import { Customer } from '@/domain/entities';

export interface UpdateCustomer {
  update: (params: UpdateCustomer.Params) => Promise<UpdateCustomer.Result>;
}

export namespace UpdateCustomer {
  export type Params = {
    document: string;
    name?: string;
    email?: string;
    phone?: string;
  };

  export type Result = Customer;
}
