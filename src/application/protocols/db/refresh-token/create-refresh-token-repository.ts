export interface CreateRefreshTokenRepository {
  create: (params: CreateRefreshTokenRepository.Params) => Promise<CreateRefreshTokenRepository.Result>;
}

export namespace CreateRefreshTokenRepository {
  export type Params = {
    userId: string;
    token: string;
    expiresAt: Date;
  };
  export type Result = void;
}
