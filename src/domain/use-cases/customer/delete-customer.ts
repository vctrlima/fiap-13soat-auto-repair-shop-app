export interface DeleteCustomer {
  delete: (params: DeleteCustomer.Params) => Promise<DeleteCustomer.Result>;
}

export namespace DeleteCustomer {
  export type Params = { document: string };
  export type Result = void;
}
