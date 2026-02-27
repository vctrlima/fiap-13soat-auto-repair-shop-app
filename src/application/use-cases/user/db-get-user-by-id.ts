import { GetUserByIdRepository } from '@/application/protocols/db';
import { GetUserById } from '@/domain/use-cases';

export class DbGetUserById implements GetUserById {
  constructor(private readonly getUserByIdRepository: GetUserByIdRepository) {}

  async getById(params: GetUserById.Params): Promise<GetUserById.Result> {
    return await this.getUserByIdRepository.getById(params);
  }
}
