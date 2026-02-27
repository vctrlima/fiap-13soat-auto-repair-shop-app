import { makeDeleteCustomer } from '@/main/factories/use-cases';
import { DeleteCustomerController } from '@/presentation/controllers';

export const makeDeleteCustomerController = (): DeleteCustomerController =>
  new DeleteCustomerController(makeDeleteCustomer());
