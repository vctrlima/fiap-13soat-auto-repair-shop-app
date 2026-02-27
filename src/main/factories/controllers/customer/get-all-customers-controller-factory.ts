import { makeGetAllCustomers } from '@/main/factories/use-cases';
import { GetAllCustomersController } from '@/presentation/controllers';

export const makeGetAllCustomersController = (): GetAllCustomersController =>
  new GetAllCustomersController(makeGetAllCustomers());
