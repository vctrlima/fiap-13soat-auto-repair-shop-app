import { makeDeleteUser } from '@/main/factories/use-cases';
import { DeleteUserController } from '@/presentation/controllers';

export const makeDeleteUserController = (): DeleteUserController => new DeleteUserController(makeDeleteUser());
