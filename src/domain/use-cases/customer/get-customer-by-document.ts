import { Customer } from '@/domain/entities';

export interface GetCustomerByDocument {
  getByDocument: (params: GetCustomerByDocument.Params) => Promise<GetCustomerByDocument.Result | null>;
}

export namespace GetCustomerByDocument {
  export type Params = { document: string };
  export type Result = Customer;
}
