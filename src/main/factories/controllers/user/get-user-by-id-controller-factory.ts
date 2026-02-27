import { makeGetUserById } from '@/main/factories/use-cases';
import { GetUserByIdController } from '@/presentation/controllers';

export const makeGetUserByIdController = (): GetUserByIdController =>
  new GetUserByIdController(makeGetUserById());
