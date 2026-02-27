import { Customer } from '@/domain/entities';
import { DefaultPageParams, Page } from '@/domain/types';

export interface GetAllCustomers {
  getAll: (params: GetAllCustomers.Params) => Promise<GetAllCustomers.Result>;
}

export namespace GetAllCustomers {
  export type Params = DefaultPageParams & {
    name?: string;
    document?: string;
    email?: string;
    phone?: string;
  };

  export type Result = Page<Customer>;
}
