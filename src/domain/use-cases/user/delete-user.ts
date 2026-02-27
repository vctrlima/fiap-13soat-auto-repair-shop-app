export interface DeleteUser {
  delete: (data: DeleteUser.Params) => Promise<DeleteUser.Result>;
}

export namespace DeleteUser {
  export type Params = { id: string };
  export type Result = void;
}
