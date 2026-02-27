import {
  CreateRefreshTokenRepository,
  DeleteRefreshTokenRepository,
  ValidateRefreshTokenRepository,
} from '@/application/protocols/db';
import { PrismaClient } from '@prisma/client';

type RefreshTokenRepository = CreateRefreshTokenRepository &
  ValidateRefreshTokenRepository &
  DeleteRefreshTokenRepository;

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async create(
    params: CreateRefreshTokenRepository.Params
  ): Promise<CreateRefreshTokenRepository.Result> {
    await this.prisma.refreshToken.create({
      data: {
        userId: params.userId,
        token: params.token,
        expiresAt: params.expiresAt,
      },
    });
  }

  public async validate(
    params: ValidateRefreshTokenRepository.Params
  ): Promise<ValidateRefreshTokenRepository.Result> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token: params.token },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
      },
    });
    if (!refreshToken) return null;
    if (refreshToken.expiresAt <= new Date()) {
      await this.delete({ token: params.token });
      return null;
    }
    return refreshToken;
  }

  public async delete(
    params: DeleteRefreshTokenRepository.Params
  ): Promise<DeleteRefreshTokenRepository.Result> {
    await this.prisma.refreshToken.delete({ where: { token: params.token } });
  }
}
