import { User } from '@/domain/entities';
import { Role } from '@/domain/enums';

export interface UpdateUser {
  update: (data: UpdateUser.Params) => Promise<UpdateUser.Result>;
}

export namespace UpdateUser {
  export type Params = {
    id: string;
    name?: string;
    email?: string;
    password?: string;
    role?: Role;
  };

  export type Result = Omit<User, 'password'>;
}
