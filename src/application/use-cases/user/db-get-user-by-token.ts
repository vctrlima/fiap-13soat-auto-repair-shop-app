import { Decrypter } from '@/application/protocols/cryptography';
import { GetUserById, GetUserByToken } from '@/domain/use-cases';
import env from '@/main/config/env';

export class DbGetUserByToken implements GetUserByToken {
  constructor(private readonly decrypter: Decrypter, private readonly findUserById: GetUserById) {}

  async getByToken(params: GetUserByToken.Params): Promise<GetUserByToken.Result> {
    const { id: userId } = await this.decrypter.decrypt({
      cipherText: params.token,
      secret: env.jwtAccessTokenSecret,
    });
    const user = await this.findUserById.getById({ id: userId });
    if (!user) throw new Error('User not found');
    return user;
  }
}
