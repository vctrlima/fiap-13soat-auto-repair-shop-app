import { User } from '@/domain/entities';

export interface AuthenticateUserRepository {
  authenticate: (params: AuthenticateUserRepository.Params) => Promise<AuthenticateUserRepository.Result>;
}

export namespace AuthenticateUserRepository {
  export type Params = { email: string };
  export type Result = User | null;
}
