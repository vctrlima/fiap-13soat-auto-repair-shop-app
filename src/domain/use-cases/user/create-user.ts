import { User } from '@/domain/entities';
import { Role } from '@/domain/enums';

export interface CreateUser {
  create: (data: CreateUser.Params) => Promise<CreateUser.Result>;
}

export namespace CreateUser {
  export type Params = {
    name: string;
    email: string;
    password: string;
    role: Role;
  };

  export type Result = Omit<User, 'password'>;
}
