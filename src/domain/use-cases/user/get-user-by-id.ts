import { User } from '@/domain/entities';

export interface GetUserById {
  getById: (params: GetUserById.Params) => Promise<GetUserById.Result>;
}

export namespace GetUserById {
  export type Params = { id: string };
  export type Result = Omit<User, 'password'>;
}
