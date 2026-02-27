import { GetAllUsersRepository } from '@/application/protocols/db';
import { GetAllUsers } from '@/domain/use-cases';

export class DbGetAllUsers implements GetAllUsers {
  constructor(private readonly getAllUsersRepository: GetAllUsersRepository) {}

  async getAll(params: GetAllUsers.Params): Promise<GetAllUsers.Result> {
    return await this.getAllUsersRepository.getAll(params);
  }
}
