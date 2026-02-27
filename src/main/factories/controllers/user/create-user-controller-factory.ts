import { makeCreateUser } from '@/main/factories/use-cases';
import { makeEmailValidator, makePasswordValidator } from '@/main/factories/validators';
import { CreateUserController } from '@/presentation/controllers';

export const makeCreateUserController = (): CreateUserController =>
  new CreateUserController(makeCreateUser(), makeEmailValidator(), makePasswordValidator());
