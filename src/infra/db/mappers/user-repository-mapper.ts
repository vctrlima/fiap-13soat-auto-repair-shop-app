import { User } from '@/domain/entities';
import { UserRepositoryType } from '@/infra/db/types';

export class UserRepositoryMapper {
  public static dataToEntity(data: UserRepositoryType): Omit<User, 'password'> {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  public static dataToEntityWithPassword(data: UserRepositoryType): User {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
