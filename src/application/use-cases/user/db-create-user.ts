import { Hasher } from '@/application/protocols/cryptography';
import { CreateUserRepository } from '@/application/protocols/db';
import { CreateUser } from '@/domain/use-cases';

export class DbCreateUser implements CreateUser {
  constructor(private readonly createUserRepository: CreateUserRepository, private readonly hasher: Hasher) {}

  async create(params: CreateUser.Params): Promise<CreateUser.Result> {
    params.password = await this.hasher.hash(params.password);
    return await this.createUserRepository.create(params);
  }
}
