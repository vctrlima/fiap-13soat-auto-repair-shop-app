import { GetUserByToken } from '@/domain/use-cases';

export interface GetUserByTokenRepository {
  getByToken: (params: GetUserByToken.Params) => Promise<GetUserByToken.Result>;
}

export namespace GetUserByTokenRepository {
  export type Params = GetUserByToken.Params;
  export type Result = GetUserByToken.Result;
}
