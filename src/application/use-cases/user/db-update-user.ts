import { Hasher } from '@/application/protocols/cryptography';
import { UpdateUserRepository } from '@/application/protocols/db';
import { UpdateUser } from '@/domain/use-cases';

export class DbUpdateUser implements UpdateUser {
  constructor(private readonly updateUserRepository: UpdateUserRepository, private readonly hasher: Hasher) {}

  async update(params: UpdateUser.Params): Promise<UpdateUser.Result> {
    if (params.password) params.password = await this.hasher.hash(params.password);
    return await this.updateUserRepository.update(params);
  }
}
