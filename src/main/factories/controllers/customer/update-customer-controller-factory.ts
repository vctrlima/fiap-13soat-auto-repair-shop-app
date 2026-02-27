import { makeUpdateCustomer } from '@/main/factories/use-cases';
import { makeCustomerDocumentValidator } from '@/main/factories/validators';
import { UpdateCustomerController } from '@/presentation/controllers';

export const makeUpdateCustomerController = (): UpdateCustomerController =>
  new UpdateCustomerController(makeUpdateCustomer(), makeCustomerDocumentValidator());
