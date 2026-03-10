import { Customer } from "@/domain/entities";

export interface GetCustomerByToken {
  getByToken: (
    params: GetCustomerByToken.Params,
  ) => Promise<GetCustomerByToken.Result>;
}

export namespace GetCustomerByToken {
  export type Params = { token: string };
  export type Result = Pick<Customer, "id" | "name" | "email" | "document">;
}
