import { DeleteUserRepository } from '@/application/protocols/db';
import { DeleteUser } from '@/domain/use-cases';

export class DbDeleteUser implements DeleteUser {
  constructor(private readonly deleteUserRepository: DeleteUserRepository) {}

  async delete(params: DeleteUser.Params): Promise<DeleteUser.Result> {
    return await this.deleteUserRepository.delete(params);
  }
}
