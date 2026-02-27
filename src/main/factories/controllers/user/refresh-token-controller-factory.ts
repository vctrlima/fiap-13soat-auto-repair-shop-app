import { makeRefreshToken } from '@/main/factories/use-cases';
import { RefreshTokenController } from '@/presentation/controllers';

export const makeRefreshTokenController = (): RefreshTokenController =>
  new RefreshTokenController(makeRefreshToken());
