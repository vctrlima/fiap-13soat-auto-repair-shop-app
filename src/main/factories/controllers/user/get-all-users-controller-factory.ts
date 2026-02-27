import { makeGetAllUsers } from '@/main/factories/use-cases';
import { GetAllUsersController } from '@/presentation/controllers';

export const makeGetAllUsersController = (): GetAllUsersController =>
  new GetAllUsersController(makeGetAllUsers());
