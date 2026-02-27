import { User } from '@/domain/entities';

export interface GetUserByToken {
  getByToken: (params: GetUserByToken.Params) => Promise<GetUserByToken.Result>;
}

export namespace GetUserByToken {
  export type Params = { token: string };
  export type Result = Omit<User, 'password'>;
}
