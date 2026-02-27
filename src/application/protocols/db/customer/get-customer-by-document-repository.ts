import { GetCustomerByDocument } from '@/domain/use-cases';

export interface GetCustomerByDocumentRepository {
  getByDocument: (
    params: GetCustomerByDocumentRepository.Params
  ) => Promise<GetCustomerByDocumentRepository.Result>;
}

export namespace GetCustomerByDocumentRepository {
  export type Params = GetCustomerByDocument.Params;
  export type Result = GetCustomerByDocument.Result;
}
