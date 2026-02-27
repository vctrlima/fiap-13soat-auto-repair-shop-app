import { Decrypter, Encrypter } from '@/application/protocols/cryptography';
import {
  CreateRefreshTokenRepository,
  DeleteRefreshTokenRepository,
  GetUserByIdRepository,
  ValidateRefreshTokenRepository,
} from '@/application/protocols/db';
import { RefreshToken } from '@/domain/use-cases';
import env from '@/main/config/env';
import { UnauthorizedError } from '@/presentation/errors';
import { randomUUID } from 'crypto';

export class DbRefreshToken implements RefreshToken {
  constructor(
    private readonly validateRefreshTokenRepository: ValidateRefreshTokenRepository,
    private readonly deleteRefreshTokenRepository: DeleteRefreshTokenRepository,
    private readonly createRefreshTokenRepository: CreateRefreshTokenRepository,
    private readonly getUserByIdRepository: GetUserByIdRepository,
    private readonly decrypter: Decrypter,
    private readonly encrypter: Encrypter
  ) {}

  async refresh(data: RefreshToken.Params): Promise<RefreshToken.Result> {
    const tokenData = await this.validateRefreshTokenRepository.validate({
      token: data.refreshToken,
    });

    if (!tokenData) throw new UnauthorizedError();

    let tokenPayload: any;
    try {
      tokenPayload = await this.decrypter.decrypt({
        cipherText: data.refreshToken,
        secret: env.jwtRefreshTokenSecret,
      });
    } catch {
      await this.deleteRefreshTokenRepository.delete({ token: data.refreshToken });
      throw new UnauthorizedError();
    }

    if (tokenPayload.id !== tokenData.userId) {
      await this.deleteRefreshTokenRepository.delete({ token: data.refreshToken });
      throw new UnauthorizedError();
    }

    let user;
    try {
      user = await this.getUserByIdRepository.getById({ id: tokenData.userId });
    } catch {
      await this.deleteRefreshTokenRepository.delete({ token: data.refreshToken });
      throw new UnauthorizedError();
    }

    const accessToken = await this.encrypter.encrypt({
      plainText: user.id,
      secret: env.jwtAccessTokenSecret,
      expiresIn: '15m',
    });
    const refreshTokenId = randomUUID();
    const newRefreshToken = await this.encrypter.encrypt({
      plainText: user.id,
      secret: env.jwtRefreshTokenSecret,
      expiresIn: '7d',
      jti: refreshTokenId,
    });

    await this.deleteRefreshTokenRepository.delete({ token: data.refreshToken });
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);
    await this.createRefreshTokenRepository.create({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: refreshTokenExpiresAt,
    });

    return {
      user: user,
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
