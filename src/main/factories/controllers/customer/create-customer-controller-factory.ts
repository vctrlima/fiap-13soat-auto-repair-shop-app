import { makeCreateCustomer } from '@/main/factories/use-cases';
import { makeCustomerDocumentValidator } from '@/main/factories/validators';
import { CreateCustomerController } from '@/presentation/controllers';

export const makeCreateCustomerController = (): CreateCustomerController =>
  new CreateCustomerController(makeCreateCustomer(), makeCustomerDocumentValidator());
