export interface ValidateRefreshTokenRepository {
  validate: (params: ValidateRefreshTokenRepository.Params) => Promise<ValidateRefreshTokenRepository.Result>;
}

export namespace ValidateRefreshTokenRepository {
  export type Params = { token: string };
  export type Result = {
    id: string;
    userId: string;
    expiresAt: Date;
  } | null;
}
