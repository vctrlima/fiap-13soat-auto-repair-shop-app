import { makeUpdateUser } from '@/main/factories/use-cases';
import { makeEmailValidator, makePasswordValidator } from '@/main/factories/validators';
import { UpdateUserController } from '@/presentation/controllers';

export const makeUpdateUserController = (): UpdateUserController =>
  new UpdateUserController(makeUpdateUser(), makeEmailValidator(), makePasswordValidator());
