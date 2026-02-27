import { makeGetCustomerByDocument } from '@/main/factories/use-cases';
import { GetCustomerByDocumentController } from '@/presentation/controllers';

export const makeGetCustomerByDocumentController = (): GetCustomerByDocumentController =>
  new GetCustomerByDocumentController(makeGetCustomerByDocument());
