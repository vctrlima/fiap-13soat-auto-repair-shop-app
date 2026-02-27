import { User } from '@/domain/entities';

export interface AuthenticateUser {
  authenticate: (data: AuthenticateUser.Params) => Promise<AuthenticateUser.Result>;
}

export namespace AuthenticateUser {
  export type Params = { email: string; password: string };

  export type Result = {
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  };
}
