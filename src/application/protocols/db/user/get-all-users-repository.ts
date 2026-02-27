import { GetAllUsers } from '@/domain/use-cases';

export interface GetAllUsersRepository {
  getAll: (params: GetAllUsersRepository.Params) => Promise<GetAllUsersRepository.Result>;
}

export namespace GetAllUsersRepository {
  export type Params = GetAllUsers.Params;
  export type Result = GetAllUsers.Result;
}
