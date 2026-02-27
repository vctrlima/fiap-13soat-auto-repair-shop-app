import { DeleteUser } from '@/domain/use-cases';

export interface DeleteUserRepository {
  delete: (params: DeleteUserRepository.Params) => Promise<DeleteUserRepository.Result>;
}

export namespace DeleteUserRepository {
  export type Params = DeleteUser.Params;
  export type Result = DeleteUser.Result;
}
