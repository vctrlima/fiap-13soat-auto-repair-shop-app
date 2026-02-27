import { User } from '@/domain/entities';

export interface RefreshToken {
  refresh: (data: RefreshToken.Params) => Promise<RefreshToken.Result>;
}

export namespace RefreshToken {
  export type Params = { refreshToken: string };

  export type Result = {
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  };
}
