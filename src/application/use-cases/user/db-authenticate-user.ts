import { Encrypter, HashComparer } from "@/application/protocols/cryptography";
import {
  AuthenticateUserRepository,
  CreateRefreshTokenRepository,
} from "@/application/protocols/db";
import { AuthenticateUser } from "@/domain/use-cases";
import {
  authLoginCounter,
  authLoginFailureCounter,
} from "@/infra/observability";
import env from "@/main/config/env";
import { UnauthorizedError } from "@/presentation/errors";
import { randomUUID } from "crypto";

export class DbAuthenticateUser implements AuthenticateUser {
  constructor(
    private readonly authenticateUserRepository: AuthenticateUserRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly createRefreshTokenRepository: CreateRefreshTokenRepository,
  ) {}

  async authenticate(
    data: AuthenticateUser.Params,
  ): Promise<AuthenticateUser.Result> {
    const user = await this.authenticateUserRepository.authenticate({
      email: data.email,
    });
    if (!user) {
      authLoginFailureCounter.add(1);
      throw new UnauthorizedError();
    }

    const passwordMatches = await this.hashComparer.compare(
      data.password,
      user.password,
    );
    if (!passwordMatches) {
      authLoginFailureCounter.add(1);
      throw new UnauthorizedError();
    }

    const accessToken = await this.encrypter.encrypt({
      plainText: user.id,
      secret: env.jwtAccessTokenSecret,
      expiresIn: "15m",
    });
    const refreshTokenId = randomUUID();
    const refreshToken = await this.encrypter.encrypt({
      plainText: user.id,
      secret: env.jwtRefreshTokenSecret,
      expiresIn: "7d",
      jti: refreshTokenId,
    });

    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);
    await this.createRefreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshTokenExpiresAt,
    });

    authLoginCounter.add(1);
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}
