import { makeAuthenticateUser } from '@/main/factories/use-cases';
import { makeEmailValidator, makePasswordValidator } from '@/main/factories/validators';
import { AuthenticateUserController } from '@/presentation/controllers';

export const makeAuthenticateUserController = (): AuthenticateUserController =>
  new AuthenticateUserController(makeAuthenticateUser(), makeEmailValidator(), makePasswordValidator());
