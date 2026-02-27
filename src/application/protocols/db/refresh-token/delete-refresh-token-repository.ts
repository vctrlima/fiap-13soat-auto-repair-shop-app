export interface DeleteRefreshTokenRepository {
  delete: (params: DeleteRefreshTokenRepository.Params) => Promise<DeleteRefreshTokenRepository.Result>;
}

export namespace DeleteRefreshTokenRepository {
  export type Params = { token: string };
  export type Result = void;
}
