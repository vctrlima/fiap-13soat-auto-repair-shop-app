import { User } from '@/domain/entities';
import { Role } from '@/domain/enums';
import { DefaultPageParams, Page } from '@/domain/types';

export interface GetAllUsers {
  getAll: (params: GetAllUsers.Params) => Promise<GetAllUsers.Result>;
}

export namespace GetAllUsers {
  export type Params = DefaultPageParams & {
    name?: string;
    email?: string;
    role?: Role;
  };

  export type Result = Page<Omit<User, 'password'>>;
}
